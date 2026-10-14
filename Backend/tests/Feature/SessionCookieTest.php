<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SessionCookieTest extends TestCase
{
    use RefreshDatabase;

    private function credentials(): array
    {
        $user = User::factory()->create(['access_level' => 'warehouse', 'is_active' => true, 'password' => 'cookie-test-password']);
        config(['cors.allowed_origins' => ['https://wba.example.test']]);

        return ['email' => $user->email, 'password' => 'cookie-test-password', 'accessLevel' => 'warehouse', 'useSessionCookie' => true];
    }

    public function test_cookie_sign_in_uses_a_host_only_http_only_session_and_no_json_token(): void
    {
        $credentials = $this->credentials();
        $result = $this->withHeader('Origin', 'https://wba.example.test')->postJson('/api/auth/login', $credentials)->assertOk()->assertJsonMissingPath('token');
        $cookie = $result->getCookie('wba_session', false);
        $this->assertNotNull($cookie);
        $this->assertTrue($cookie->isHttpOnly());
        $this->assertSame('lax', $cookie->getSameSite());
        $this->assertSame('/api', $cookie->getPath());
        $this->assertNull($cookie->getDomain());
        $this->assertSame(0, $cookie->getExpiresTime());
        $this->assertDatabaseHas('api_tokens', ['token_hash' => hash('sha256', $cookie->getValue())]);
        $this->withCredentials()->withUnencryptedCookie('wba_session', $cookie->getValue())->getJson('/api/auth/me')->assertOk()->assertJsonPath('user.email', $credentials['email']);
        $this->getJson('/api/users')->assertForbidden();
    }

    public function test_cookie_is_secure_on_https_and_logout_revokes_it(): void
    {
        $credentials = $this->credentials();
        $result = $this->withHeader('Origin', 'https://wba.example.test')->postJson('https://localhost/api/auth/login', $credentials)->assertOk();
        $cookie = $result->getCookie('wba_session', false);
        $this->assertNotNull($cookie);
        $this->assertTrue($cookie->isSecure());
        $this->withCredentials()->withUnencryptedCookie('wba_session', $cookie->getValue())->postJson('/api/auth/logout')->assertOk()->assertCookieExpired('wba_session');
        $this->assertDatabaseCount('api_tokens', 0);
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_cookie_sign_in_rejects_untrusted_missing_and_null_origins(): void
    {
        $credentials = $this->credentials();
        foreach (['https://attacker.example.test', 'null', ''] as $origin) {
            $this->withHeader('Origin', $origin)->postJson('/api/auth/login', $credentials)->assertForbidden();
        }
        $this->assertDatabaseCount('api_tokens', 0);
    }

    public function test_cookie_mutations_require_trusted_origin_and_json(): void
    {
        $credentials = $this->credentials();
        $cookie = $this->withHeader('Origin', 'https://wba.example.test')->postJson('/api/auth/login', $credentials)->assertOk()->getCookie('wba_session', false);
        $this->assertNotNull($cookie);
        $this->withCredentials()->withUnencryptedCookie('wba_session', $cookie->getValue());
        $this->withHeader('Origin', 'https://attacker.example.test')->postJson('/api/auth/logout')->assertForbidden();
        $this->withHeader('Origin', 'https://wba.example.test')->post('/api/auth/logout')->assertForbidden();
        $this->assertDatabaseCount('api_tokens', 1);
    }

    public function test_expired_and_deactivated_cookie_sessions_are_rejected(): void
    {
        $credentials = $this->credentials();
        $cookie = $this->withHeader('Origin', 'https://wba.example.test')->postJson('/api/auth/login', $credentials)->assertOk()->getCookie('wba_session', false);
        $this->assertNotNull($cookie);
        $this->withCredentials()->withUnencryptedCookie('wba_session', $cookie->getValue());
        User::where('email', $credentials['email'])->update(['is_active' => false]);
        $this->getJson('/api/auth/me')->assertUnauthorized();
        User::where('email', $credentials['email'])->update(['is_active' => true]);
        DB::table('api_tokens')->update(['expires_at' => now()->subMinute()]);
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_legacy_bearer_sign_in_still_works_during_the_rollout(): void
    {
        $credentials = $this->credentials();
        unset($credentials['useSessionCookie']);
        $token = $this->postJson('/api/auth/login', $credentials)->assertOk()->json('token');
        $this->assertIsString($token);
        $this->withHeader('Authorization', 'Bearer '.$token)->getJson('/api/auth/me')->assertOk();
    }

    public function test_reactivation_also_issues_a_cookie_and_invalid_cookies_do_not_authenticate(): void
    {
        $credentials = $this->credentials();
        User::where('email', $credentials['email'])->firstOrFail()->deactivate(30);
        $result = $this->withHeader('Origin', 'https://wba.example.test')->postJson('/api/auth/reactivate', $credentials)->assertOk()->assertJsonMissingPath('token');
        $cookie = $result->getCookie('wba_session', false);
        $this->assertNotNull($cookie);
        $this->withCredentials()->withUnencryptedCookie('wba_session', $cookie->getValue())->getJson('/api/auth/me')->assertOk();
        $this->withUnencryptedCookie('wba_session', 'invalid-cookie')->getJson('/api/auth/me')->assertUnauthorized();
    }
}
