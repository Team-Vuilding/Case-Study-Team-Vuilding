<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        putenv('WBA_ADMIN_NAME=Deployment Admin');
        putenv('WBA_ADMIN_EMAIL=DEPLOYMENT@example.com');
        putenv('WBA_ADMIN_PASSWORD=deployment-password-123');
    }

    protected function tearDown(): void
    {
        foreach (['WBA_ADMIN_NAME', 'WBA_ADMIN_EMAIL', 'WBA_ADMIN_PASSWORD'] as $key) {
            putenv($key);
        }
        parent::tearDown();
    }

    public function test_environment_provisions_one_admin_with_a_hashed_password(): void
    {
        $this->artisan('wba:create-admin', ['--from-env' => true, '--no-interaction' => true])->assertSuccessful();
        $user = User::sole();
        $this->assertSame('deployment@example.com', $user->email);
        $this->assertSame('admin', $user->access_level);
        $this->assertTrue($user->is_active);
        $this->assertTrue(Hash::check('deployment-password-123', $user->password));
        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'deployment-password-123', 'accessLevel' => 'admin'])->assertOk();
    }

    public function test_redeploy_does_not_replace_or_reactivate_an_existing_admin(): void
    {
        $user = User::factory()->create(['access_level' => 'admin', 'is_active' => false]);
        $password = $user->password;
        $this->artisan('wba:create-admin', ['--from-env' => true, '--no-interaction' => true])->assertSuccessful();
        $this->assertDatabaseCount('users', 1);
        $this->assertSame($password, $user->fresh()->password);
        $this->assertFalse($user->fresh()->is_active);
    }

    public function test_bootstrap_rejects_a_short_or_missing_password(): void
    {
        putenv('WBA_ADMIN_PASSWORD=short');
        $this->artisan('wba:create-admin', ['--from-env' => true, '--no-interaction' => true])->assertFailed();
        putenv('WBA_ADMIN_PASSWORD');
        $this->artisan('wba:create-admin', ['--from-env' => true, '--no-interaction' => true])->assertFailed();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_local_generation_is_rejected_outside_local_environment(): void
    {
        $this->artisan('wba:create-admin', ['--generate' => true, '--no-interaction' => true])->assertFailed();
        $this->assertDatabaseCount('users', 0);
    }
}
