<?php

namespace Tests\Feature;

use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ProductExpiryTest extends TestCase
{
    use RefreshDatabase;

    private function signIn(string $role = 'admin'): void
    {
        $user = User::factory()->create(['access_level' => $role, 'is_active' => true, 'password' => 'expiry-test-password']);
        $token = $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'expiry-test-password', 'accessLevel' => $role])->assertOk()->json('token');
        $this->withHeaders(['Authorization' => 'Bearer '.$token]);
    }

    private function body(array $overrides = []): array
    {
        return ['name' => 'Filter', 'fsn' => 'Normal', 'unitPrice' => 100, 'physicalOnHand' => 5, 'warehouseBin' => 'Shelf-02', 'hasShelfLife' => true, ...$overrides];
    }

    public function test_expiry_tracking_needs_only_the_actual_date_not_a_duration(): void
    {
        $this->signIn();
        $date = today()->addMonths(8)->toDateString();
        $id = $this->postJson('/api/items', $this->body(['expiresAt' => $date]))->assertCreated()
            ->assertJsonPath('data.hasShelfLife', true)->assertJsonPath('data.shelfLifeMonths', null)
            ->assertJsonPath('data.sku', 'WBA-EXP-001')->json('data.id');
        $this->assertDatabaseHas('items', ['id' => $id, 'tracks_expiry' => true, 'shelf_life_months' => null]);
        $this->assertDatabaseHas('batches', ['item_id' => $id, 'quantity' => 5, 'expires_at' => $date]);
    }

    public function test_initial_stock_requires_a_valid_expiry_date(): void
    {
        $this->signIn();
        $this->postJson('/api/items', $this->body())->assertUnprocessable();
        $this->postJson('/api/items', $this->body(['expiresAt' => today()->subDay()->toDateString()]))->assertUnprocessable();
        $this->assertDatabaseCount('items', 0);
        $this->assertDatabaseCount('batches', 0);
    }

    public function test_empty_expiring_product_requires_a_date_when_stock_is_received(): void
    {
        $this->signIn();
        $product = $this->postJson('/api/items', $this->body(['physicalOnHand' => 0]))->assertCreated()->assertJsonPath('data.hasShelfLife', true)->json('data');
        $this->assertDatabaseCount('batches', 0);
        $this->signIn('warehouse');
        $this->postJson('/api/warehouse/movements', ['code' => $product['sku'], 'quantity' => 2])->assertUnprocessable();
        $date = today()->addDays(10)->toDateString();
        $this->postJson('/api/warehouse/movements', ['code' => $product['sku'], 'quantity' => 2, 'expiresAt' => $date])->assertCreated();
        $this->assertDatabaseHas('batches', ['item_id' => $product['id'], 'quantity' => 2, 'expires_at' => $date]);
    }

    public function test_non_expiring_products_do_not_create_batches(): void
    {
        $this->signIn();
        $this->postJson('/api/items', $this->body(['hasShelfLife' => false]))->assertCreated()
            ->assertJsonPath('data.hasShelfLife', false)->assertJsonPath('data.sku', 'WBA-NEX-001');
        $this->assertDatabaseCount('batches', 0);
    }

    public function test_existing_duration_based_products_keep_their_tracking_and_duration(): void
    {
        $item = Item::create(['name' => 'Legacy filter', 'sku' => 'LEGACY-EXP', 'warehouse_bin' => 'B', 'shelf_life_months' => 12]);
        $this->signIn();
        $this->getJson('/api/items/'.$item->id)->assertOk()->assertJsonPath('data.hasShelfLife', true);
        $body = $this->body();
        unset($body['physicalOnHand']);
        $this->putJson('/api/items/'.$item->id, $body)->assertOk()->assertJsonPath('data.shelfLifeMonths', 12)->assertJsonPath('data.hasShelfLife', true);
        $this->signIn('warehouse');
        $this->postJson('/api/warehouse/movements', ['code' => $item->sku, 'quantity' => 1])->assertUnprocessable();
    }

    public function test_tracking_migration_can_roll_back_without_losing_existing_product_data(): void
    {
        $item = Item::create(['name' => 'Legacy filter', 'sku' => 'LEGACY-EXP', 'warehouse_bin' => 'B', 'shelf_life_months' => 12]);
        $migration = require database_path('migrations/2026_10_14_025742_add_tracks_expiry_to_items_table.php');
        $migration->down();
        $this->assertFalse(Schema::hasColumn('items', 'tracks_expiry'));
        $this->assertDatabaseHas('items', ['id' => $item->id, 'shelf_life_months' => 12]);
        $migration->up();
        $this->assertNull(DB::table('items')->where('id', $item->id)->value('tracks_expiry'));
        $this->assertTrue($item->fresh()->tracksExpiry());
    }

    public function test_expiry_stock_counts_cannot_bypass_batch_adjustments(): void
    {
        $this->signIn();
        $id = $this->postJson('/api/items', $this->body(['expiresAt' => today()->addDays(10)->toDateString()]))->assertCreated()->json('data.id');
        $this->signIn('warehouse');
        $this->postJson('/api/warehouse/items/'.$id.'/reconcile', ['quantity' => 3, 'reason' => 'Physical count'])->assertUnprocessable();
        $this->assertDatabaseHas('items', ['id' => $id, 'physical_on_hand' => 5]);
        $this->assertDatabaseHas('batches', ['item_id' => $id, 'quantity' => 5]);
    }

    public function test_purchase_order_receipts_require_the_actual_expiry_date(): void
    {
        $this->signIn();
        $id = $this->postJson('/api/items', $this->body(['physicalOnHand' => 0]))->assertCreated()->json('data.id');
        $supplier = $this->postJson('/api/purchasing/suppliers', ['name' => 'Expiry supplier'])->assertOk()->json('data.id');
        $this->signIn('purchasing');
        $order = $this->postJson('/api/purchasing/purchase-orders', ['supplier_id' => $supplier, 'items' => [['item_id' => $id, 'quantity' => 2, 'unit_price' => 100]]])->assertCreated()->json('id');
        $this->signIn();
        $this->putJson('/api/purchasing/purchase-orders/'.$order.'/status', ['status' => 'approved'])->assertOk();
        $this->signIn('warehouse');
        $this->putJson('/api/purchasing/purchase-orders/'.$order.'/status', ['status' => 'received'])->assertUnprocessable();
        $this->assertDatabaseHas('purchase_orders', ['id' => $order, 'status' => 'approved']);
        $this->assertDatabaseCount('batches', 0);
        $date = today()->addMonths(3)->toDateString();
        $this->putJson('/api/purchasing/purchase-orders/'.$order.'/status', ['status' => 'received', 'expiresAt' => $date])->assertOk();
        $this->assertDatabaseHas('batches', ['item_id' => $id, 'quantity' => 2, 'expires_at' => $date]);
    }
}
