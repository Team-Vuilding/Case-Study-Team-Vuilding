<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SystemApiTest extends TestCase
{
    use RefreshDatabase;

    private function signIn(string $role = 'admin'): User
    {
        $user = User::factory()->create(['access_level' => $role, 'role' => ucfirst($role), 'is_active' => true, 'password' => 'secure-password-123']);
        $result = $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'secure-password-123', 'accessLevel' => $role])->assertOk();
        $this->withHeaders(['Authorization' => 'Bearer '.$result->json('token')]);

        return $user;
    }

    private function product(array $overrides = []): array
    {
        return ['name' => 'Test appliance', 'sku' => 'TEST-001', 'category' => 'A', 'fsn' => 'Normal',
            'unitPrice' => 100, 'physicalOnHand' => 10, 'warehouseBin' => 'BIN-01', 'hasShelfLife' => false, ...$overrides];
    }

    public function test_api_requires_server_authentication(): void
    {
        $this->getJson('/api/items')->assertUnauthorized();
        $this->postJson('/api/users', [])->assertUnauthorized();
        $this->getJson('/api/dashboard/metrics')->assertUnauthorized();
    }

    public function test_login_checks_password_role_and_active_status(): void
    {
        $user = User::factory()->create(['access_level' => 'warehouse', 'is_active' => true, 'password' => 'secure-password-123']);
        $body = ['email' => $user->email, 'password' => 'secure-password-123', 'accessLevel' => 'admin'];
        $this->postJson('/api/auth/login', $body)->assertUnprocessable();
        $body['accessLevel'] = 'warehouse';
        $body['password'] = 'wrong-password';
        $this->postJson('/api/auth/login', $body)->assertUnprocessable();
        $user->update(['is_active' => false]);
        $body['password'] = 'secure-password-123';
        $this->postJson('/api/auth/login', $body)->assertUnprocessable();
    }

    public function test_token_is_hashed_and_logout_revokes_it(): void
    {
        $this->signIn();
        $this->getJson('/api/auth/me')->assertOk()->assertJsonMissingPath('user.password');
        $this->postJson('/api/auth/logout')->assertOk();
        $this->getJson('/api/auth/me')->assertUnauthorized();
        $this->assertDatabaseCount('api_tokens', 0);
    }

    public function test_expired_tokens_are_rejected(): void
    {
        $this->signIn();
        DB::table('api_tokens')->update(['expires_at' => now()->subMinute()]);
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_sales_cannot_modify_inventory_or_read_administration(): void
    {
        $this->signIn('sales');
        $this->postJson('/api/items', $this->product())->assertForbidden();
        $this->getJson('/api/users')->assertForbidden();
        $this->getJson('/api/audit-logs')->assertForbidden();
        $this->getJson('/api/purchasing/purchase-orders')->assertForbidden();
        $this->getJson('/api/items')->assertOk();
    }

    public function test_products_persist_with_initial_movement_and_audit(): void
    {
        $this->signIn();
        $this->postJson('/api/items', $this->product())->assertCreated()->assertJsonPath('data.physicalOnHand', 10);
        $this->getJson('/api/items')->assertOk()->assertJsonPath('data.0.sku', 'TEST-001');
        $this->assertDatabaseHas('items', ['sku' => 'TEST-001', 'physical_on_hand' => 10]);
        $this->assertDatabaseHas('stock_movements', ['quantity' => 10, 'type' => 'stock_in']);
        $this->assertDatabaseHas('audit_events', ['event_type' => 'PRODUCT_CATALOG_ADDED']);
        $this->postJson('/api/items', $this->product())->assertUnprocessable();
        $this->assertDatabaseCount('items', 1);
    }

    public function test_stock_changes_persist_and_reject_overselling_without_partial_writes(): void
    {
        $this->signIn();
        $this->postJson('/api/items', $this->product())->assertCreated();
        $this->postJson('/api/warehouse/scan', ['code' => 'TEST-001'])->assertForbidden();
        $this->signIn('warehouse');
        $this->postJson('/api/warehouse/movements', ['code' => 'TEST-001', 'quantity' => 5])->assertCreated();
        $this->postJson('/api/warehouse/movements', ['code' => 'TEST-001', 'quantity' => 16, 'type' => 'stock_out'])->assertUnprocessable();
        $this->assertDatabaseHas('items', ['physical_on_hand' => 15, 'paper_spreadsheet_count' => 15]);
        $this->assertDatabaseCount('stock_movements', 2);
        $this->postJson('/api/warehouse/movements', ['code' => 'TEST-001', 'quantity' => 4, 'type' => 'stock_out'])->assertCreated();
        $this->assertDatabaseHas('items', ['physical_on_hand' => 11]);
    }

    public function test_perishable_dispatch_consumes_earliest_unexpired_batch(): void
    {
        $this->signIn();
        $this->postJson('/api/items', $this->product(['hasShelfLife' => true, 'shelfLifeMonths' => 9, 'physicalOnHand' => 0]))->assertCreated();
        $this->signIn('warehouse');
        $this->postJson('/api/warehouse/movements', ['code' => 'TEST-001', 'quantity' => 3])->assertUnprocessable();
        foreach ([['LATER', 5, today()->addDays(90)->toDateString()], ['FIRST', 3, today()->addDays(10)->toDateString()]] as [$lot, $quantity, $expiry]) {
            $this->postJson('/api/warehouse/movements', ['code' => 'TEST-001', 'quantity' => $quantity, 'lot' => $lot, 'expiresAt' => $expiry])->assertCreated();
        }
        $this->postJson('/api/warehouse/movements', ['code' => 'TEST-001', 'quantity' => 4, 'type' => 'stock_out'])->assertCreated();
        $this->assertDatabaseHas('batches', ['lot' => 'FIRST', 'quantity' => 0]);
        $this->assertDatabaseHas('batches', ['lot' => 'LATER', 'quantity' => 4]);
        DB::table('batches')->where('lot', 'LATER')->update(['expires_at' => today()->subDay()]);
        $this->postJson('/api/warehouse/movements', ['code' => 'TEST-001', 'quantity' => 1, 'type' => 'stock_out'])->assertUnprocessable();
    }

    public function test_accounts_are_server_managed_and_deactivation_revokes_sessions(): void
    {
        $admin = $this->signIn();
        $this->postJson('/api/users', ['name' => 'Staff', 'email' => 'staff@example.com', 'password' => 'staff-password-123', 'accessLevel' => 'warehouse'])
            ->assertCreated()->assertJsonMissingPath('data.password');
        $user = User::where('email', 'staff@example.com')->firstOrFail();
        DB::table('api_tokens')->insert(['user_id' => $user->id, 'token_hash' => hash('sha256', 'staff-token'), 'expires_at' => now()->addHour()]);
        $this->putJson('/api/users/'.$user->id, ['name' => 'Staff', 'email' => 'staff@example.com', 'accessLevel' => 'warehouse', 'status' => 'inactive'])->assertOk();
        $this->assertDatabaseMissing('api_tokens', ['user_id' => $user->id]);
        $this->deleteJson('/api/users/'.$admin->id)->assertUnprocessable();
        $this->getJson('/api/users/activity-logs')->assertOk()->assertJsonPath('data.0.action', 'Updated account');
    }

    public function test_sign_in_records_are_only_shown_in_account_activity(): void
    {
        $admin = $this->signIn();
        $this->postJson('/api/items', $this->product())->assertCreated();

        $this->getJson('/api/audit-logs')->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.eventType', 'PRODUCT_CATALOG_ADDED');
        $this->getJson('/api/users/activity-logs')->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.action', 'Signed in')
            ->assertJsonPath('data.0.actor', $admin->name)
            ->assertJsonPath('data.0.target', $admin->email);

        $this->signIn('purchasing');
        $this->getJson('/api/audit-logs')->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.eventType', 'PRODUCT_CATALOG_ADDED');
        $this->getJson('/api/users/activity-logs')->assertForbidden();
        $this->assertDatabaseCount('audit_events', 3);
    }

    public function test_order_workflow_receives_stock_only_once_and_hides_costs_from_warehouse(): void
    {
        $admin = $this->signIn();
        $item = $this->postJson('/api/items', $this->product(['physicalOnHand' => 0]))->assertCreated()->json('data.id');
        $supplier = $this->postJson('/api/purchasing/suppliers', ['name' => 'Actual supplier'])->assertOk()->json('data.id');
        $order = $this->postJson('/api/purchasing/purchase-orders', ['supplier_id' => $supplier, 'items' => [['item_id' => $item, 'quantity' => 5, 'unit_price' => 50]]])->assertCreated()->json('id');
        $this->putJson('/api/purchasing/purchase-orders/'.$order.'/status', ['status' => 'received'])->assertUnprocessable();
        $this->putJson('/api/purchasing/purchase-orders/'.$order.'/status', ['status' => 'approved'])->assertOk();
        $this->signIn('warehouse');
        $this->getJson('/api/purchasing/purchase-orders')->assertOk()->assertJsonPath('data.0.totalCost', null)->assertJsonPath('data.0.lines.0.unitCost', null);
        $this->putJson('/api/purchasing/purchase-orders/'.$order.'/status', ['status' => 'approved'])->assertForbidden();
        $this->putJson('/api/purchasing/purchase-orders/'.$order.'/status', ['status' => 'received'])->assertOk();
        $this->putJson('/api/purchasing/purchase-orders/'.$order.'/status', ['status' => 'received'])->assertUnprocessable();
        $this->assertDatabaseHas('items', ['id' => $item, 'physical_on_hand' => 5]);
    }

    public function test_metrics_are_calculated_from_database_and_reconciliation_is_audited(): void
    {
        $this->signIn();
        $id = $this->postJson('/api/items', $this->product(['storageCostPerMonth' => 2]))->assertCreated()->json('data.id');
        $this->getJson('/api/dashboard/metrics')->assertOk()->assertJsonPath('data.monthlyStorageCost', 20)->assertJsonPath('data.available', 10);
        $this->postJson('/api/warehouse/items/'.$id.'/reconcile', ['quantity' => 8, 'reason' => 'Physical count verified'])->assertOk();
        $this->assertDatabaseHas('reconciliation_logs', ['item_id' => $id, 'variance' => -2]);
        $this->getJson('/api/dashboard/metrics')->assertOk()->assertJsonPath('data.available', 8);
    }

    public function test_reference_routes_support_update_and_preserve_history(): void
    {
        $this->signIn();
        $id = $this->postJson('/api/categories', ['name' => 'Cooling', 'code' => 'COOL'])->assertOk()->json('data.id');
        $this->putJson('/api/categories/'.$id, ['name' => 'Climate', 'code' => 'COOL'])->assertOk()->assertJsonPath('data.name', 'Climate');
        $this->getJson('/api/categories')->assertOk()->assertJsonPath('data.0.name', 'Climate');
        $this->deleteJson('/api/categories/'.$id)->assertOk();
        $itemId = $this->postJson('/api/items', $this->product())->assertCreated()->json('data.id');
        $this->deleteJson('/api/items/'.$itemId)->assertUnprocessable();
    }

    public function test_storage_cost_cannot_exceed_the_database_decimal_capacity(): void
    {
        $this->signIn();
        $this->postJson('/api/items', $this->product(['storageCostPerMonth' => 100000000]))->assertUnprocessable();
        $this->assertDatabaseCount('items', 0);
    }

    public function test_purchase_order_total_overflow_is_rejected_without_partial_writes(): void
    {
        $this->signIn();
        $item = $this->postJson('/api/items', $this->product())->assertCreated()->json('data.id');
        $supplier = $this->postJson('/api/purchasing/suppliers', ['name' => 'Test supplier'])->assertOk()->json('data.id');
        $this->postJson('/api/purchasing/purchase-orders', ['supplier_id' => $supplier,
            'items' => [['item_id' => $item, 'quantity' => 1000000, 'unit_price' => 100000000]]])->assertUnprocessable();
        $this->assertDatabaseCount('purchase_orders', 0);
        $this->assertDatabaseCount('purchase_order_items', 0);
    }

    public function test_uppercase_duplicate_account_email_returns_validation_error(): void
    {
        $admin = $this->signIn();
        $this->postJson('/api/users', ['name' => 'Duplicate', 'email' => strtoupper($admin->email),
            'password' => 'staff-password-123', 'accessLevel' => 'sales'])->assertUnprocessable();
        $this->assertDatabaseCount('users', 1);
    }

    public function test_receipts_reject_integer_overflow_without_changing_stock_or_order(): void
    {
        $this->signIn();
        $item = $this->postJson('/api/items', $this->product(['physicalOnHand' => 0]))->assertCreated()->json('data.id');
        DB::table('items')->where('id', $item)->update(['physical_on_hand' => 2147483647, 'paper_spreadsheet_count' => 2147483647]);
        $supplier = $this->postJson('/api/purchasing/suppliers', ['name' => 'Test supplier'])->assertOk()->json('data.id');
        $order = $this->postJson('/api/purchasing/purchase-orders', ['supplier_id' => $supplier,
            'items' => [['item_id' => $item, 'quantity' => 1, 'unit_price' => 50]]])->assertCreated()->json('id');
        $this->putJson('/api/purchasing/purchase-orders/'.$order.'/status', ['status' => 'approved'])->assertOk();
        $this->putJson('/api/purchasing/purchase-orders/'.$order.'/status', ['status' => 'received'])->assertUnprocessable();
        $this->assertDatabaseHas('purchase_orders', ['id' => $order, 'status' => 'approved']);
        $this->signIn('warehouse');
        $this->postJson('/api/warehouse/movements', ['code' => 'TEST-001', 'quantity' => 1])->assertUnprocessable();
        $this->assertDatabaseHas('items', ['id' => $item, 'physical_on_hand' => 2147483647]);
        $this->assertDatabaseCount('stock_movements', 0);
    }
}
