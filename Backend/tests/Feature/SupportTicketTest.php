<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class SupportTicketTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.gmail' => ['client_id' => 'test-client', 'client_secret' => 'test-secret', 'refresh_token' => 'test-refresh', 'sender' => 'sender@gmail.com']]);
        Http::preventStrayRequests();
    }

    private function signIn(string $role = 'admin'): User
    {
        $user = User::factory()->create(['access_level' => $role, 'is_active' => true]);
        $token = Str::random(64);
        DB::table('api_tokens')->insert(['user_id' => $user->id, 'token_hash' => hash('sha256', $token), 'expires_at' => now()->addHour()]);
        $this->withHeaders(['Authorization' => 'Bearer '.$token]);

        return $user;
    }

    private function ticket(array $overrides = []): array
    {
        return [...['category' => 'inventory', 'subject' => 'Stock quantity mismatch', 'description' => 'The recorded quantity does not match the physical count.', 'page' => 'inventory', 'steps' => 'Open Inventory and check TEST-001.', 'consent' => true], ...$overrides];
    }

    private function fakeGmail(int $sendStatus = 200, array $sendBody = ['id' => 'gmail-message-123']): void
    {
        Http::fake(['oauth2.googleapis.com/token' => Http::response(['access_token' => 'test-access'], 200), 'gmail.googleapis.com/*' => Http::response($sendBody, $sendStatus)]);
    }

    public static function roles(): array
    {
        return array_map(fn ($role) => [$role], ['admin', 'warehouse', 'purchasing', 'sales']);
    }

    #[DataProvider('roles')]
    public function test_each_role_can_email_a_ticket_to_the_fixed_support_address(string $role): void
    {
        $user = $this->signIn($role);
        $this->fakeGmail();
        $response = $this->postJson('/api/support/tickets', $this->ticket(['to' => 'attacker@example.com', 'email' => 'spoofed@example.com']));
        $response->assertCreated()->assertJsonPath('data.status', 'sent');
        $reference = $response->json('data.reference');
        $this->assertMatchesRegularExpression('/^WBA-[A-Z0-9-]+$/', $reference);
        Http::assertSent(function ($request) use ($user, $reference, $role) {
            if (! str_contains($request->url(), '/messages/send')) {
                return false;
            }
            $mime = quoted_printable_decode(base64_decode(strtr($request['raw'], '-_', '+/')));
            $this->assertStringContainsString('To: vincentjamesguhiling@gmail.com', $mime);
            $this->assertStringContainsString($user->email, $mime);
            $this->assertStringContainsString('Reply-To:', $mime);
            $this->assertStringContainsString($reference, $mime);
            $this->assertStringContainsString('Stock quantity mismatch', $mime);
            $this->assertStringContainsString('Role: '.$role, $mime);
            $this->assertStringNotContainsString('spoofed@example.com', $mime);
            $this->assertStringNotContainsString('attacker@example.com', $mime);

            return $request->hasHeader('Authorization', 'Bearer test-access');
        });
    }

    public function test_unauthenticated_users_cannot_send_email(): void
    {
        $this->postJson('/api/support/tickets', $this->ticket())->assertUnauthorized();
        Http::assertNothingSent();
    }

    public function test_invalid_fields_and_missing_consent_are_rejected_before_email(): void
    {
        $this->signIn();
        $this->postJson('/api/support/tickets', $this->ticket(['category' => 'bad', 'subject' => "Bad\r\nBcc: injected@example.com", 'description' => 'short', 'page' => 'bad', 'steps' => str_repeat('x', 2001), 'consent' => false]))
            ->assertUnprocessable()->assertJsonValidationErrors(['category', 'subject', 'description', 'page', 'steps', 'consent']);
        Http::assertNothingSent();
    }

    public function test_missing_credentials_do_not_report_success(): void
    {
        $this->signIn();
        config(['services.gmail.refresh_token' => '']);
        $this->postJson('/api/support/tickets', $this->ticket())->assertStatus(503);
        Http::assertNothingSent();
    }

    public function test_gmail_rejection_does_not_report_success_or_expose_provider_details(): void
    {
        $this->signIn();
        $this->fakeGmail(403, ['error' => 'private-provider-detail']);
        $response = $this->postJson('/api/support/tickets', $this->ticket())->assertStatus(502);
        $this->assertStringNotContainsString('private-provider-detail', $response->getContent());
        $this->assertStringNotContainsString('test-secret', $response->getContent());
    }

    public function test_invalid_token_response_stops_before_sending(): void
    {
        $this->signIn();
        Http::fake(['oauth2.googleapis.com/token' => Http::response(['error' => 'invalid_grant'], 400)]);
        $this->postJson('/api/support/tickets', $this->ticket())->assertStatus(502);
        Http::assertSentCount(1);
    }

    public function test_gmail_success_without_a_message_id_is_not_confirmed(): void
    {
        $this->signIn();
        $this->fakeGmail(200, []);
        $this->postJson('/api/support/tickets', $this->ticket())->assertStatus(502);
    }

    public function test_network_failure_does_not_report_success(): void
    {
        $this->signIn();
        Http::fake(['oauth2.googleapis.com/token' => Http::failedConnection()]);
        $this->postJson('/api/support/tickets', $this->ticket())->assertStatus(502)->assertJsonStructure(['message', 'reference']);
    }

    public function test_oversized_ticket_content_is_rejected(): void
    {
        $this->signIn();
        $this->postJson('/api/support/tickets', $this->ticket(['subject' => str_repeat('x', 121), 'description' => str_repeat('x', 5001)]))
            ->assertUnprocessable()->assertJsonValidationErrors(['subject', 'description']);
        Http::assertNothingSent();
    }

    public function test_ticket_sending_is_limited_per_account(): void
    {
        $this->signIn();
        $this->fakeGmail();
        for ($index = 0; $index < 5; $index++) {
            $this->postJson('/api/support/tickets', $this->ticket())->assertCreated();
        }
        $this->postJson('/api/support/tickets', $this->ticket())->assertStatus(429);
        Http::assertSentCount(10);
    }

    private function contact(array $overrides = []): array
    {
        return [...['name' => 'Visitor', 'email' => 'visitor@example.com', 'category' => 'Technical', 'subject' => 'Inventory question', 'message' => 'Please help me understand the stock count.', 'consent' => true], ...$overrides];
    }

    public function test_contact_support_accepts_visitors_without_creating_an_account(): void
    {
        $this->fakeGmail();
        $this->postJson('/api/support/contact', $this->contact(['to' => 'attacker@example.com', 'access_level' => 'admin']))
            ->assertCreated()->assertJsonPath('data.status', 'sent');
        $this->assertDatabaseCount('users', 0);
        Http::assertSent(function ($request) {
            if (! str_contains($request->url(), '/messages/send')) {
                return false;
            }
            $mime = quoted_printable_decode(base64_decode(strtr($request['raw'], '-_', '+/')));
            $this->assertStringContainsString('To: vincentjamesguhiling@gmail.com', $mime);
            $this->assertStringContainsString('visitor@example.com', $mime);
            $this->assertStringContainsString('visitor (unverified)', $mime);
            $this->assertStringNotContainsString('attacker@example.com', $mime);
            $this->assertStringNotContainsString('Role: admin', $mime);

            return true;
        });
    }

    public function test_contact_support_validates_input_and_consent_before_delivery(): void
    {
        $this->postJson('/api/support/contact', $this->contact(['name' => "Injected\nname", 'email' => 'bad-email', 'category' => 'bad', 'subject' => "Subject\r\nBcc: attacker@example.com", 'message' => 'short', 'consent' => false]))
            ->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'category', 'subject', 'message', 'consent']);
        Http::assertNothingSent();
    }

    public function test_contact_support_accepts_all_form_categories(): void
    {
        $this->fakeGmail();
        foreach (['Technical', 'Billing', 'Account', 'Feedback'] as $category) {
            $this->postJson('/api/support/contact', $this->contact(['category' => $category]))->assertCreated();
        }
    }

    public function test_contact_support_does_not_report_success_when_delivery_fails(): void
    {
        $this->fakeGmail(403, ['error' => 'private-provider-detail']);
        $response = $this->postJson('/api/support/contact', $this->contact())->assertStatus(502);
        $this->assertStringNotContainsString('private-provider-detail', $response->getContent());
        $this->assertStringNotContainsString('vincentjamesguhiling@gmail.com', $response->getContent());
    }

    public function test_contact_support_is_limited_per_ip(): void
    {
        $this->fakeGmail();
        for ($index = 0; $index < 5; $index++) {
            $this->postJson('/api/support/contact', $this->contact())->assertCreated();
        }
        $this->postJson('/api/support/contact', $this->contact())->assertStatus(429);
        Http::assertSentCount(10);
    }

    public function test_contact_support_reports_unavailable_delivery_without_an_email_fallback(): void
    {
        config(['services.gmail.refresh_token' => '']);
        $response = $this->postJson('/api/support/contact', $this->contact())->assertStatus(503);
        $this->assertStringNotContainsString('vincentjamesguhiling@gmail.com', $response->getContent());
        Http::assertNothingSent();
    }

    public function test_contact_support_rejects_oversized_fields_before_delivery(): void
    {
        $this->postJson('/api/support/contact', $this->contact(['name' => str_repeat('x', 101), 'email' => str_repeat('x', 250).'@example.com', 'subject' => str_repeat('x', 121), 'message' => str_repeat('x', 5001)]))
            ->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'subject', 'message']);
        Http::assertNothingSent();
    }
}
