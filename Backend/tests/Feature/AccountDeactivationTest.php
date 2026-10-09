<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AccountDeactivationTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::factory()->create([
            'access_level' => 'admin',
            'role' => 'Admin',
            'is_active' => true,
            'password' => 'SecurePass1234!',
        ]);
    }

    private function createStaff(string $role = 'warehouse'): User
    {
        return User::factory()->create([
            'access_level' => $role,
            'role' => ucfirst($role).' Staff',
            'is_active' => true,
            'password' => 'SecurePass1234!',
        ]);
    }

    public function test_user_can_deactivate_own_account_with_30_day_deadline(): void
    {
        $this->createAdmin(); // ensure another admin exists
        $user = $this->createStaff();

        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'SecurePass1234!',
            'accessLevel' => 'warehouse',
        ])->assertOk();

        $token = $login->json('token');

        $now = Carbon::parse('2026-10-09 12:00:00');
        Carbon::setTestNow($now);

        $response = $this->withHeaders(['Authorization' => 'Bearer '.$token])
            ->postJson('/api/auth/deactivate', ['password' => 'SecurePass1234!']);

        $response->assertOk();
        $response->assertJson([
            'remainingDays' => 30,
        ]);

        $freshUser = $user->fresh();
        $this->assertFalse($freshUser->is_active);
        $this->assertSame('deactivated', $freshUser->account_status);
        $this->assertNotNull($freshUser->deactivated_at);
        $this->assertNotNull($freshUser->deletion_at);
        $this->assertTrue($freshUser->deletion_at->equalTo($now->copy()->addDays(30)));

        // Tokens revoked
        $this->assertDatabaseMissing('api_tokens', ['user_id' => $user->id]);

        Carbon::setTestNow();
    }

    public function test_deactivated_account_login_returns_recovery_info(): void
    {
        $now = Carbon::parse('2026-10-09 12:00:00');
        Carbon::setTestNow($now);

        $user = $this->createStaff();
        $user->deactivate(30);

        // Attempt login with correct credentials
        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'SecurePass1234!',
            'accessLevel' => 'warehouse',
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'accountStatus' => 'deactivated',
            'canReactivate' => true,
            'remainingDays' => 30,
        ]);

        Carbon::setTestNow();
    }

    public function test_user_can_reactivate_account_within_30_day_period(): void
    {
        $now = Carbon::parse('2026-10-09 12:00:00');
        Carbon::setTestNow($now);

        $user = $this->createStaff();
        $user->deactivate(30);

        // Move 10 days forward (still 20 days remaining)
        Carbon::setTestNow($now->copy()->addDays(10));

        $response = $this->postJson('/api/auth/reactivate', [
            'email' => $user->email,
            'password' => 'SecurePass1234!',
            'accessLevel' => 'warehouse',
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['user', 'token', 'message']);

        $freshUser = $user->fresh();
        $this->assertTrue($freshUser->is_active);
        $this->assertSame('active', $freshUser->account_status);
        $this->assertNull($freshUser->deactivated_at);
        $this->assertNull($freshUser->deletion_at);

        Carbon::setTestNow();
    }

    public function test_expired_account_cannot_be_reactivated(): void
    {
        $now = Carbon::parse('2026-10-09 12:00:00');
        Carbon::setTestNow($now);

        $user = $this->createStaff();
        $user->deactivate(30);

        // Move 31 days forward (deadline passed)
        Carbon::setTestNow($now->copy()->addDays(31));

        $response = $this->postJson('/api/auth/reactivate', [
            'email' => $user->email,
            'password' => 'SecurePass1234!',
            'accessLevel' => 'warehouse',
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'accountStatus' => 'expired',
            'canReactivate' => false,
        ]);

        Carbon::setTestNow();
    }

    public function test_purge_command_permanently_deletes_only_expired_accounts(): void
    {
        $now = Carbon::parse('2026-10-09 12:00:00');
        Carbon::setTestNow($now);

        $activeUser = $this->createStaff('sales');
        $recoveringUser = $this->createStaff('purchasing');
        $recoveringUser->deactivate(30);

        $expiredUser = $this->createStaff('warehouse');
        $expiredUser->deactivate(30);

        // Advance time so only expiredUser is past 30 days
        Carbon::setTestNow($now->copy()->addDays(31));

        // Create a related stock movement to verify foreign key safety (nullOnDelete)
        $item = DB::table('items')->insertGetId([
            'sku' => 'TEST-SKU-99',
            'name' => 'Solar Inverter',
            'category_classification' => 'A',
            'unit_price' => 500,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $movementId = DB::table('stock_movements')->insertGetId([
            'item_id' => $item,
            'user_id' => $expiredUser->id,
            'type' => 'stock_in',
            'quantity' => 10,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Run purge command
        $exitCode = Artisan::call('accounts:purge-expired');
        $this->assertSame(0, $exitCode);

        // Active user still exists
        $this->assertDatabaseHas('users', ['id' => $activeUser->id]);

        // Expired user was permanently deleted
        $this->assertDatabaseMissing('users', ['id' => $expiredUser->id]);

        // Check related movement had user_id set to null
        $movement = DB::table('stock_movements')->where('id', $movementId)->first();
        $this->assertNull($movement->user_id);

        // Audit event recorded
        $this->assertDatabaseHas('audit_events', [
            'event_type' => 'Account Purged',
            'target' => $expiredUser->email,
        ]);

        Carbon::setTestNow();
    }

    public function test_sole_active_admin_cannot_be_deactivated(): void
    {
        $soleAdmin = $this->createAdmin();

        $login = $this->postJson('/api/auth/login', [
            'email' => $soleAdmin->email,
            'password' => 'SecurePass1234!',
            'accessLevel' => 'admin',
        ])->assertOk();

        $token = $login->json('token');

        $response = $this->withHeaders(['Authorization' => 'Bearer '.$token])
            ->postJson('/api/auth/deactivate', ['password' => 'SecurePass1234!']);

        $response->assertStatus(422);
        $this->assertTrue($soleAdmin->fresh()->is_active);
    }
}
