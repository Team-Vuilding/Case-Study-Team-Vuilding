<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AuthRateLimitTest extends TestCase
{
    use RefreshDatabase;

    private function account(string $email = 'admin@throttle.test'): User
    {
        return User::factory()->create(['email' => $email, 'access_level' => 'admin', 'is_active' => true, 'password' => 'correct-test-password']);
    }

    private function credentials(string $email = 'admin@throttle.test', string $password = 'wrong-password'): array
    {
        return ['email' => $email, 'password' => $password, 'accessLevel' => 'admin'];
    }

    private function failFiveTimes(string $email = 'admin@throttle.test'): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/auth/login', $this->credentials($email))->assertUnprocessable();
        }
    }

    public function test_one_account_cannot_block_other_accounts_on_the_same_network(): void
    {
        $this->account();
        $this->account('other@throttle.test');
        $this->failFiveTimes();
        $this->postJson('/api/auth/login', $this->credentials())->assertStatus(429)->assertJsonPath('retryAfter', 180)->assertHeader('Retry-After', '180');
        $this->postJson('/api/auth/login', $this->credentials('other@throttle.test', 'correct-test-password'))->assertOk();
    }

    public function test_cooldown_lasts_three_minutes_from_the_threshold_and_retries_do_not_extend_it(): void
    {
        $this->travelTo(now()->startOfSecond());
        $this->account();
        $this->failFiveTimes();
        $this->travel(60)->seconds();
        $this->postJson('/api/auth/login', $this->credentials())->assertStatus(429)->assertJsonPath('retryAfter', 180);
        $this->travel(179)->seconds();
        $this->postJson('/api/auth/login', $this->credentials(password: 'correct-test-password'))->assertStatus(429)->assertJsonPath('retryAfter', 1)->assertHeader('Retry-After', '1');
        $this->travel(1)->seconds();
        $this->postJson('/api/auth/login', $this->credentials(password: 'correct-test-password'))->assertOk();
    }

    public function test_normalized_email_roles_and_recovery_share_the_same_limit(): void
    {
        $this->account();
        $this->failFiveTimes();
        $this->postJson('/api/auth/reactivate', [...$this->credentials(' ADMIN@THROTTLE.TEST '), 'accessLevel' => 'warehouse'])->assertStatus(429);
        $this->postJson('/api/auth/login', [...$this->credentials('admin@throttle.test'), 'accessLevel' => 'sales'])->assertStatus(429);
        $this->postJson('/api/auth/reactivate', $this->credentials())->assertStatus(429);
    }

    public function test_successful_sign_ins_do_not_accumulate_and_reset_failed_attempts(): void
    {
        $this->account();
        for ($cycle = 0; $cycle < 3; $cycle++) {
            $this->failFiveTimes();
            $this->postJson('/api/auth/login', $this->credentials(password: 'correct-test-password'))->assertOk();
        }
        for ($attempt = 0; $attempt < 8; $attempt++) {
            $this->postJson('/api/auth/login', $this->credentials(password: 'correct-test-password'))->assertOk();
        }
    }

    public function test_other_networks_are_independent_and_unknown_accounts_are_still_limited(): void
    {
        $this->failFiveTimes('missing@throttle.test');
        $this->postJson('/api/auth/login', $this->credentials('missing@throttle.test'))->assertStatus(429);
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.20']);
        $this->postJson('/api/auth/login', $this->credentials('missing@throttle.test'))->assertUnprocessable();
    }

    public function test_invalid_payloads_do_not_lock_an_account_and_input_sizes_are_bounded(): void
    {
        $this->account();
        for ($attempt = 0; $attempt < 8; $attempt++) {
            $this->postJson('/api/auth/login', ['email' => 'admin@throttle.test', 'password' => 'wrong'])->assertUnprocessable()->assertJsonValidationErrors('accessLevel');
        }
        $this->postJson('/api/auth/login', $this->credentials(password: str_repeat('a', 129)))->assertUnprocessable()->assertJsonValidationErrors('password');
        $this->postJson('/api/auth/login', $this->credentials(password: 'correct-test-password'))->assertOk();
    }

    public function test_database_cache_persists_anonymous_limits_without_plain_email_keys(): void
    {
        config(['cache.default' => 'database']);
        $this->account();
        $this->failFiveTimes();
        $this->postJson('/api/auth/login', $this->credentials())->assertStatus(429)->assertJsonPath('retryAfter', 180);
        $this->postJson('/api/auth/login', $this->credentials(password: 'correct-test-password'))->assertStatus(429);
        $keys = DB::table('cache')->pluck('key')->implode(' ');
        $this->assertStringContainsString('auth-attempts:', $keys);
        $this->assertStringNotContainsString('admin@throttle.test', $keys);
    }
}
