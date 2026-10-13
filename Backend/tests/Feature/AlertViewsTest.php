<?php

namespace Tests\Feature;

use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AlertViewsTest extends TestCase
{
    use RefreshDatabase;

    private function signIn(User $user): void
    {
        $token = $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'alert-test-password', 'accessLevel' => $user->access_level])->assertOk()->json('token');
        $this->withHeaders(['Authorization' => 'Bearer '.$token]);
    }

    public function test_views_are_persistent_per_user_idempotent_and_changed_alerts_become_unread(): void
    {
        $first = User::factory()->create(['access_level' => 'admin', 'password' => 'alert-test-password']);
        $second = User::factory()->create(['access_level' => 'warehouse', 'password' => 'alert-test-password']);
        $item = Item::create(['name' => 'Low stock', 'sku' => 'LOW-01', 'warehouse_bin' => 'B', 'physical_on_hand' => 0]);
        $this->signIn($first);
        $alert = $this->getJson('/api/dashboard/alerts')->assertOk()->assertJsonPath('data.0.isRead', false)->json('data.0');
        $body = ['alerts' => [['id' => $alert['id'], 'version' => $alert['version']]]];
        for ($i = 0; $i < 2; $i++) {
            $this->postJson('/api/dashboard/alerts/viewed', $body)->assertOk();
        }
        $this->assertDatabaseCount('alert_views', 1);
        $this->getJson('/api/dashboard/alerts')->assertJsonPath('data.0.isRead', true);
        $this->signIn($second);
        $this->getJson('/api/dashboard/alerts')->assertJsonPath('data.0.isRead', false);
        $this->signIn($first);
        $item->update(['physical_on_hand' => 1, 'safety_stock_off_peak' => 5]);
        $changed = $this->getJson('/api/dashboard/alerts')->assertJsonPath('data.0.isRead', false)->json('data.0');
        $this->assertNotSame($alert['version'], $changed['version']);
        $this->postJson('/api/dashboard/alerts/viewed', $body)->assertOk();
        $this->getJson('/api/dashboard/alerts')->assertJsonPath('data.0.isRead', false);
        $this->postJson('/api/dashboard/alerts/viewed', ['alerts' => [['id' => $changed['id'], 'version' => $changed['version']]]])->assertOk();
        $this->getJson('/api/dashboard/alerts')->assertJsonPath('data.0.isRead', true);
    }

    public function test_invalid_or_inaccessible_alerts_cannot_be_marked_and_expiry_details_are_structured(): void
    {
        $this->postJson('/api/dashboard/alerts/viewed', [])->assertUnauthorized();
        $item = Item::create(['name' => 'Expiry product', 'sku' => 'EXP-01', 'warehouse_bin' => 'B', 'physical_on_hand' => 5]);
        DB::table('batches')->insert(['item_id' => $item->id, 'lot' => 'LOT-long-identifier', 'quantity' => 5, 'location' => 'B', 'received_at' => today(), 'expires_at' => today()->addDay(), 'created_at' => now(), 'updated_at' => now()]);
        $admin = User::factory()->create(['access_level' => 'admin', 'password' => 'alert-test-password']);
        $this->signIn($admin);
        $expiry = $this->getJson('/api/dashboard/alerts')->assertJsonPath('data.0.type', 'expiry')->assertJsonPath('data.0.quantity', 5)->assertJsonPath('data.0.daysLeft', 1)->json('data.0');
        $sales = User::factory()->create(['access_level' => 'sales', 'password' => 'alert-test-password']);
        $this->signIn($sales);
        $this->getJson('/api/dashboard/alerts')->assertJsonCount(0, 'data');
        $this->postJson('/api/dashboard/alerts/viewed', ['alerts' => [['id' => $expiry['id'], 'version' => $expiry['version']]]])->assertOk();
        $this->assertDatabaseCount('alert_views', 0);
        $this->postJson('/api/dashboard/alerts/viewed', ['alerts' => [['id' => 'bad', 'version' => 'bad']]])->assertUnprocessable();
    }
}
