<?php

namespace Tests\Feature;

use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryReportTest extends TestCase
{
    use RefreshDatabase;

    private function signIn(string $role = 'warehouse'): User
    {
        $user = User::factory()->create(['access_level' => $role, 'is_active' => true, 'password' => 'report-password-123']);
        $login = $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'report-password-123', 'accessLevel' => $role])->assertOk();
        $this->withHeaders(['Authorization' => 'Bearer '.$login->json('token')]);

        return $user;
    }

    private function product(): Item
    {
        return Item::create(['name' => 'Air Conditioner', 'sku' => 'REPORT-001', 'warehouse_bin' => 'BIN-01', 'physical_on_hand' => 5, 'paper_spreadsheet_count' => 5]);
    }

    public function test_warehouse_reports_are_saved_and_audited_without_changing_stock(): void
    {
        $staff = $this->signIn();
        $item = $this->product();
        $this->postJson('/api/warehouse/items/'.$item->id.'/reports', ['kind' => 'info', 'message' => 'Moved to the lower shelf.', 'actor' => 'Spoofed name'])
            ->assertCreated()->assertJsonPath('data.actor', $staff->name)->assertJsonPath('data.kind', 'info');
        $this->postJson('/api/warehouse/items/'.$item->id.'/reports', ['kind' => 'mismatch', 'message' => 'Shelf count is lower than the ledger.', 'countedQuantity' => 0])
            ->assertCreated()->assertJsonPath('data.countedQuantity', 0)->assertJsonPath('data.ledgerQuantity', 5)->assertJsonPath('data.variance', -5);
        $this->assertDatabaseHas('items', ['id' => $item->id, 'physical_on_hand' => 5, 'paper_spreadsheet_count' => 5]);
        $this->assertDatabaseCount('stock_movements', 0);
        $this->assertDatabaseCount('stock_counts', 0);
        $this->assertDatabaseHas('audit_events', ['event_type' => 'Warehouse mismatch', 'severity' => 'warning', 'target' => $item->sku, 'user_id' => $staff->id]);
        $this->getJson('/api/items/'.$item->id.'/reports')->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('data.0.kind', 'mismatch');
        $this->getJson('/api/items')->assertJsonPath('data.0.reportCount', 2);
        $this->getJson('/api/audit-logs')->assertForbidden();
        $this->signIn('admin');
        $this->getJson('/api/audit-logs')->assertOk()->assertJsonPath('data.0.eventType', 'Warehouse mismatch');
    }

    public function test_reporting_permissions_do_not_expose_logs_to_other_roles(): void
    {
        $item = $this->product();
        $this->getJson('/api/items/'.$item->id.'/reports')->assertUnauthorized();
        $this->postJson('/api/warehouse/items/'.$item->id.'/reports', [])->assertUnauthorized();
        foreach (['admin', 'purchasing', 'sales'] as $role) {
            $this->signIn($role);
            $this->postJson('/api/warehouse/items/'.$item->id.'/reports', ['kind' => 'info', 'message' => 'Test report'])->assertForbidden();
            $response = $this->getJson('/api/items/'.$item->id.'/reports');
            if ($role === 'admin') {
                $response->assertOk();
            } else {
                $response->assertForbidden();
            }
        }
        $this->assertDatabaseCount('inventory_reports', 0);
    }

    public function test_invalid_report_fields_are_rejected(): void
    {
        $this->signIn();
        $item = $this->product();
        foreach ([
            ['kind' => 'unknown', 'message' => 'Test report'],
            ['kind' => 'info', 'message' => '  '],
            ['kind' => 'info', 'message' => str_repeat('x', 1001)],
            ['kind' => 'info', 'message' => 'Test report', 'countedQuantity' => 1],
            ['kind' => 'mismatch', 'message' => 'Test report', 'countedQuantity' => -1],
            ['kind' => 'mismatch', 'message' => 'Test report', 'countedQuantity' => 1.5],
        ] as $body) {
            $this->postJson('/api/warehouse/items/'.$item->id.'/reports', $body)->assertUnprocessable();
        }
        $this->assertDatabaseCount('inventory_reports', 0);
        $this->postJson('/api/warehouse/items/'.$item->id.'/reports', ['kind' => 'mismatch', 'message' => 'Investigate the mixed labels.'])
            ->assertCreated()->assertJsonPath('data.countedQuantity', null)->assertJsonPath('data.variance', null);
    }

    public function test_report_history_survives_product_renames_and_archiving_and_blocks_deletion(): void
    {
        $this->signIn();
        $item = $this->product();
        $this->postJson('/api/warehouse/items/'.$item->id.'/reports', ['kind' => 'info', 'message' => 'Supplier discontinued this model.'])->assertCreated();
        $item->update(['sku' => 'RENAMED-001', 'name' => 'Renamed product', 'physical_on_hand' => 0, 'paper_spreadsheet_count' => 0]);
        $this->signIn('admin');
        $this->postJson('/api/items/'.$item->id.'/archive', ['reason' => 'Discontinued product'])->assertOk();
        $this->getJson('/api/items/archived')->assertJsonPath('data.0.canDelete', false)->assertJsonPath('data.0.reportCount', 1);
        $this->getJson('/api/items/'.$item->id.'/reports')->assertOk()->assertJsonPath('data.0.message', 'Supplier discontinued this model.');
        $this->deleteJson('/api/items/'.$item->id, ['reason' => 'Remove old product'])->assertUnprocessable();
        $this->assertDatabaseHas('inventory_reports', ['item_id' => $item->id]);
        $this->signIn();
        $this->postJson('/api/warehouse/items/'.$item->id.'/reports', ['kind' => 'info', 'message' => 'Another note'])->assertUnprocessable();
        $this->assertDatabaseCount('inventory_reports', 1);
    }

    public function test_report_actor_is_retained_after_account_deletion(): void
    {
        $staff = $this->signIn();
        $item = $this->product();
        $this->postJson('/api/warehouse/items/'.$item->id.'/reports', ['kind' => 'info', 'message' => 'Count checked on the shelf.'])->assertCreated();
        $staff->delete();
        $this->signIn('admin');
        $this->getJson('/api/items/'.$item->id.'/reports')->assertOk()->assertJsonPath('data.0.actor', $staff->name);
        $this->assertDatabaseHas('inventory_reports', ['user_id' => null, 'actor' => $staff->name]);
    }

    public function test_report_history_is_paginated_and_ordered_newest_first(): void
    {
        $this->signIn();
        $item = $this->product();
        foreach (range(1, 21) as $index) {
            $this->postJson('/api/warehouse/items/'.$item->id.'/reports', ['kind' => 'info', 'message' => 'Shelf note '.$index])->assertCreated();
        }
        $this->getJson('/api/items/'.$item->id.'/reports')->assertOk()->assertJsonCount(20, 'data')
            ->assertJsonPath('data.0.message', 'Shelf note 21')->assertJsonPath('meta.total', 21)->assertJsonPath('meta.lastPage', 2);
        $this->getJson('/api/items/'.$item->id.'/reports?page=2')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.message', 'Shelf note 1');
        $this->getJson('/api/items/'.$item->id.'/reports?page=0')->assertUnprocessable();
    }
}
