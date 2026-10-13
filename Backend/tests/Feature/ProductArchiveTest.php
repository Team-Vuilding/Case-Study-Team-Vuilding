<?php

namespace Tests\Feature;

use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ProductArchiveTest extends TestCase
{
    use RefreshDatabase;

    private function signIn(string $role = 'admin'): User
    {
        $user = User::factory()->create(['access_level' => $role, 'is_active' => true, 'password' => 'secure-password-123']);
        $response = $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'secure-password-123', 'accessLevel' => $role])->assertOk();
        $this->withHeaders(['Authorization' => 'Bearer '.$response->json('token')]);

        return $user;
    }

    private function product(array $overrides = []): Item
    {
        return Item::create(['name' => 'Archive test appliance', 'sku' => 'ARCHIVE-001', 'warehouse_bin' => 'BIN-01', ...$overrides]);
    }

    private function order(Item $item, string $status): void
    {
        $supplier = DB::table('suppliers')->insertGetId(['name' => 'Test supplier']);
        $id = DB::table('purchase_orders')->insertGetId(['supplier_id' => $supplier, 'po_number' => 'TEST-PO-'.$item->id, 'status' => $status]);
        DB::table('purchase_order_items')->insert(['purchase_order_id' => $id, 'item_id' => $item->id]);
    }

    public function test_archive_and_restore_keep_product_history(): void
    {
        $admin = $this->signIn();
        $item = $this->product();
        $this->order($item, 'cancelled');
        foreach (['stock_in', 'stock_out'] as $type) {
            DB::table('stock_movements')->insert(['item_id' => $item->id, 'user_id' => $admin->id, 'type' => $type, 'quantity' => 1, 'created_at' => now(), 'updated_at' => now()]);
        }
        $this->postJson('/api/items/'.$item->id.'/archive', ['reason' => 'Discontinued by supplier'])->assertOk()->assertJsonPath('data.isArchived', true);
        $this->getJson('/api/items')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/items/'.$item->id)->assertNotFound();
        $this->getJson('/api/items/archived')->assertOk()->assertJsonPath('data.0.id', $item->id)
            ->assertJsonPath('data.0.archivedBy', $admin->name)->assertJsonPath('data.0.archiveReason', 'Discontinued by supplier')->assertJsonPath('data.0.canDelete', false);
        $this->getJson('/api/purchasing/purchase-orders')->assertOk()->assertJsonPath('data.0.lines.0.product', $item->name);
        $this->getJson('/api/dashboard/metrics')->assertOk()->assertJsonPath('data.products', 0)->assertJsonPath('data.stockouts', 0);
        $this->getJson('/api/dashboard/alerts')->assertOk()->assertJsonCount(0, 'data');
        $this->assertSame(1, collect($this->getJson('/api/dashboard/activity')->json('data'))->sum('received'));
        $this->assertDatabaseCount('stock_movements', 2);
        $this->assertDatabaseHas('audit_events', ['user_id' => $admin->id, 'event_type' => 'Product archived', 'target' => $item->sku]);
        $this->deleteJson('/api/items/'.$item->id, ['reason' => 'Remove old product'])->assertUnprocessable();
        $this->postJson('/api/items/'.$item->id.'/restore', ['reason' => 'Supplier resumed production'])->assertOk()->assertJsonPath('data.isArchived', false);
        $this->getJson('/api/items')->assertOk()->assertJsonPath('data.0.id', $item->id);
        $this->getJson('/api/items/archived')->assertJsonCount(0, 'data');
        $this->assertDatabaseHas('items', ['id' => $item->id, 'sku' => $item->sku, 'archived_at' => null]);
        $this->assertDatabaseHas('audit_events', ['user_id' => $admin->id, 'event_type' => 'Product restored', 'target' => $item->sku]);
    }

    #[DataProvider('staffRoles')]
    public function test_only_administrators_can_manage_archived_products(string $role): void
    {
        $this->signIn($role);
        $item = $this->product();
        $this->getJson('/api/items/archived')->assertForbidden();
        $this->postJson('/api/items/'.$item->id.'/archive', ['reason' => 'Discontinued'])->assertForbidden();
        $this->postJson('/api/items/'.$item->id.'/restore', ['reason' => 'Restock product'])->assertForbidden();
        $this->deleteJson('/api/items/'.$item->id, ['reason' => 'Duplicate entry'])->assertForbidden();
        $this->assertDatabaseHas('items', ['id' => $item->id, 'archived_at' => null]);
    }

    public static function staffRoles(): array
    {
        return [['warehouse'], ['purchasing'], ['sales']];
    }

    #[DataProvider('stockFields')]
    public function test_stock_and_commitments_block_archiving(string $field): void
    {
        $this->signIn();
        $item = $this->product([$field => 1]);
        $this->getJson('/api/items')->assertJsonPath('data.0.canArchive', false);
        $this->postJson('/api/items/'.$item->id.'/archive', ['reason' => 'Discontinued'])->assertUnprocessable();
        $this->assertDatabaseHas('items', ['id' => $item->id, 'archived_at' => null]);
        $this->assertSame(0, DB::table('audit_events')->where('event_type', 'Product archived')->count());
    }

    public static function stockFields(): array
    {
        return [['physical_on_hand'], ['paper_spreadsheet_count'], ['reserved'], ['allocated']];
    }

    #[DataProvider('openOrderStatuses')]
    public function test_open_purchase_orders_block_archiving(string $status): void
    {
        $this->signIn();
        $item = $this->product();
        $this->order($item, $status);
        $this->getJson('/api/items')->assertJsonPath('data.0.canArchive', false);
        $this->postJson('/api/items/'.$item->id.'/archive', ['reason' => 'Discontinued'])->assertUnprocessable();
        $this->assertDatabaseHas('items', ['id' => $item->id, 'archived_at' => null]);
    }

    public static function openOrderStatuses(): array
    {
        return [['draft'], ['pending_approval'], ['approved']];
    }

    public function test_remaining_batch_stock_blocks_archiving(): void
    {
        $this->signIn();
        $item = $this->product();
        DB::table('batches')->insert(['item_id' => $item->id, 'lot' => 'TEST-LOT', 'location' => 'BIN-01', 'quantity' => 1, 'received_at' => today(), 'expires_at' => today()->addMonth()]);
        $this->postJson('/api/items/'.$item->id.'/archive', ['reason' => 'Discontinued'])->assertUnprocessable();
        $this->assertDatabaseHas('batches', ['item_id' => $item->id, 'quantity' => 1]);
    }

    public function test_a_reason_is_required_and_duplicate_actions_are_rejected(): void
    {
        $this->signIn();
        $item = $this->product();
        $this->postJson('/api/items/'.$item->id.'/archive', ['reason' => '  '])->assertUnprocessable()->assertJsonValidationErrors('reason');
        $this->postJson('/api/items/'.$item->id.'/archive', ['reason' => str_repeat('x', 501)])->assertUnprocessable();
        $this->postJson('/api/items/'.$item->id.'/archive', ['reason' => 'Discontinued'])->assertOk();
        $this->postJson('/api/items/'.$item->id.'/archive', ['reason' => 'Discontinued'])->assertUnprocessable();
        $this->postJson('/api/items/'.$item->id.'/restore', [])->assertUnprocessable()->assertJsonValidationErrors('reason');
        $this->deleteJson('/api/items/'.$item->id, [])->assertUnprocessable()->assertJsonValidationErrors('reason');
        $this->postJson('/api/items/'.$item->id.'/restore', ['reason' => 'Restock product'])->assertOk();
        $this->postJson('/api/items/'.$item->id.'/restore', ['reason' => 'Restock product'])->assertUnprocessable();
        $this->assertSame(1, DB::table('audit_events')->where('event_type', 'Product archived')->count());
    }

    public function test_archived_products_cannot_be_edited_reordered_or_received(): void
    {
        $this->signIn();
        $item = $this->product();
        $this->postJson('/api/items/'.$item->id.'/archive', ['reason' => 'Discontinued'])->assertOk();
        $supplier = DB::table('suppliers')->insertGetId(['name' => 'Test supplier']);
        $this->postJson('/api/purchasing/purchase-orders', ['supplier_id' => $supplier, 'items' => [['item_id' => $item->id, 'quantity' => 1, 'unit_price' => 100]]])->assertUnprocessable();
        $this->putJson('/api/items/'.$item->id, ['name' => 'Edited'])->assertUnprocessable()->assertJsonPath('message', 'Restore this product before editing it.');
        $this->postJson('/api/items', ['name' => 'Duplicate SKU', 'sku' => $item->sku, 'category' => 'A', 'fsn' => 'Normal', 'unitPrice' => 100, 'physicalOnHand' => 0, 'warehouseBin' => 'BIN-02', 'hasShelfLife' => false])->assertJsonValidationErrors('sku');
        $this->signIn('warehouse');
        $this->postJson('/api/warehouse/scan', ['code' => $item->sku])->assertUnprocessable();
        $this->postJson('/api/warehouse/movements', ['code' => $item->sku, 'quantity' => 1])->assertUnprocessable();
        $this->postJson('/api/warehouse/items/'.$item->id.'/reconcile', ['quantity' => 0, 'reason' => 'Verify count'])->assertUnprocessable();
        $this->assertDatabaseCount('purchase_orders', 0);
        $this->assertDatabaseCount('stock_movements', 0);
        $this->assertDatabaseCount('stock_counts', 0);
    }

    public function test_receiving_an_order_with_an_archived_product_rolls_back_every_line(): void
    {
        $this->signIn();
        $active = $this->product(['sku' => 'ACTIVE-001']);
        $archived = $this->product();
        $this->postJson('/api/items/'.$archived->id.'/archive', ['reason' => 'Discontinued'])->assertOk();
        $this->order($archived, 'approved');
        $orderId = DB::table('purchase_order_items')->where('item_id', $archived->id)->value('purchase_order_id');
        DB::table('purchase_order_items')->where('purchase_order_id', $orderId)->update(['quantity_ordered' => 1]);
        DB::table('purchase_order_items')->insert(['purchase_order_id' => $orderId, 'item_id' => $active->id, 'quantity_ordered' => 2]);
        $this->signIn('warehouse');
        $this->putJson('/api/purchasing/purchase-orders/'.$orderId.'/status', ['status' => 'received'])->assertUnprocessable()
            ->assertJsonPath('message', 'Restore this product before receiving its delivery.');
        $this->assertDatabaseHas('purchase_orders', ['id' => $orderId, 'status' => 'approved']);
        $this->assertDatabaseHas('items', ['id' => $active->id, 'physical_on_hand' => 0]);
        $this->assertDatabaseHas('items', ['id' => $archived->id, 'physical_on_hand' => 0]);
        $this->assertSame(0, DB::table('purchase_order_items')->sum('quantity_received'));
        $this->assertDatabaseCount('stock_movements', 0);
        $this->assertDatabaseCount('batches', 0);
    }

    public function test_unused_mistakes_can_be_deleted_but_the_audit_is_retained(): void
    {
        $admin = $this->signIn();
        $item = $this->product();
        $this->postJson('/api/items/'.$item->id.'/archive', ['reason' => 'Entered by mistake'])->assertOk();
        $this->getJson('/api/items/archived')->assertJsonPath('data.0.canDelete', true);
        $this->deleteJson('/api/items/'.$item->id, ['reason' => 'Duplicate catalog entry'])->assertOk();
        $this->assertDatabaseMissing('items', ['id' => $item->id]);
        $this->assertDatabaseHas('audit_events', ['user_id' => $admin->id, 'event_type' => 'Product deleted', 'target' => $item->sku]);
        $this->assertSame(1, DB::table('audit_events')->where('event_type', 'Product archived')->count());
    }

    public function test_new_unused_products_are_immediately_archiveable(): void
    {
        $this->signIn();
        $this->postJson('/api/items', ['name' => 'Unused product', 'sku' => 'UNUSED-001', 'category' => 'A', 'fsn' => 'Normal', 'unitPrice' => 100,
            'physicalOnHand' => 0, 'warehouseBin' => 'BIN-01', 'hasShelfLife' => false])->assertCreated()
            ->assertJsonPath('data.canArchive', true)->assertJsonPath('data.reserved', 0);
    }

    public function test_archive_migration_can_be_reversed_without_losing_products(): void
    {
        $item = $this->product();
        $migration = require database_path('migrations/2026_10_13_123949_add_product_archive_fields_to_items_table.php');
        $this->assertTrue(Schema::hasColumn('items', 'archived_at'));
        $migration->down();
        $this->assertFalse(Schema::hasColumn('items', 'archived_at'));
        $this->assertDatabaseHas('items', ['id' => $item->id, 'sku' => $item->sku]);
        $migration->up();
        $this->assertTrue(Schema::hasColumn('items', 'archived_at'));
        $this->assertDatabaseHas('items', ['id' => $item->id, 'archived_at' => null]);
    }

    public function test_archive_actor_is_preserved_after_their_account_is_removed(): void
    {
        $admin = $this->signIn();
        $item = $this->product();
        $this->postJson('/api/items/'.$item->id.'/archive', ['reason' => 'Discontinued'])->assertOk();
        $admin->delete();
        $this->signIn();
        $this->getJson('/api/items/archived')->assertOk()->assertJsonPath('data.0.archivedBy', $admin->name);
        $this->assertDatabaseHas('items', ['id' => $item->id, 'archived_by' => null]);
        $this->assertDatabaseHas('audit_events', ['actor' => $admin->name, 'event_type' => 'Product archived']);
    }

    public function test_archive_eligibility_does_not_add_queries_per_catalog_product(): void
    {
        $this->signIn();
        foreach (range(1, 5) as $index) {
            $this->product(['sku' => 'QUERY-'.$index]);
        }
        DB::enableQueryLog();
        $this->getJson('/api/items')->assertOk()->assertJsonCount(5, 'data');
        $queries = count(DB::getQueryLog());
        DB::disableQueryLog();
        $this->assertLessThanOrEqual(4, $queries);
    }
}
