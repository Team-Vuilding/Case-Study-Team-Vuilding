<?php

namespace Tests\Feature;

use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ProductSkuTest extends TestCase
{
    use RefreshDatabase;

    private function signIn(string $role = 'admin'): void
    {
        $user = User::factory()->create(['access_level' => $role, 'is_active' => true, 'password' => 'sku-test-password']);
        $token = $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'sku-test-password', 'accessLevel' => $role])->assertOk()->json('token');
        $this->withHeaders(['Authorization' => 'Bearer '.$token]);
    }

    private function body(bool $expiry = false): array
    {
        return ['name' => 'Generated product', 'fsn' => 'Normal', 'unitPrice' => 100, 'physicalOnHand' => 0, 'warehouseBin' => 'BIN-01', 'hasShelfLife' => $expiry, 'shelfLifeMonths' => $expiry ? 12 : null];
    }

    public function test_preview_does_not_reserve_and_expiry_sequences_are_independent(): void
    {
        $this->signIn();
        for ($i = 0; $i < 2; $i++) {
            $this->getJson('/api/items/sku-preview?hasShelfLife=0')->assertOk()->assertJsonPath('data.sku', 'WBA-NEX-001');
        }
        $this->postJson('/api/items', $this->body())->assertCreated()->assertJsonPath('data.sku', 'WBA-NEX-001')->assertJsonPath('data.category', 'U');
        $this->getJson('/api/items/sku-preview?hasShelfLife=1')->assertOk()->assertJsonPath('data.sku', 'WBA-EXP-001');
        $this->postJson('/api/items', $this->body(true))->assertCreated()->assertJsonPath('data.sku', 'WBA-EXP-001');
        $this->postJson('/api/items', $this->body())->assertCreated()->assertJsonPath('data.sku', 'WBA-NEX-002');
    }

    public function test_archived_codes_are_skipped_and_deleted_codes_are_not_reused(): void
    {
        $this->signIn();
        Item::create(['name' => 'Archived', 'sku' => 'WBA-NEX-001', 'warehouse_bin' => 'B', 'archived_at' => now()]);
        $this->getJson('/api/items/sku-preview?hasShelfLife=0')->assertJsonPath('data.sku', 'WBA-NEX-002');
        $response = $this->postJson('/api/items', $this->body())->assertCreated()->assertJsonPath('data.sku', 'WBA-NEX-002');
        $this->deleteJson('/api/items/'.$response->json('data.id'), ['reason' => 'Unused test item'])->assertOk();
        $this->postJson('/api/items', $this->body())->assertCreated()->assertJsonPath('data.sku', 'WBA-NEX-003');
    }

    public function test_invalid_creates_do_not_consume_codes_and_large_numbers_keep_growing(): void
    {
        $this->signIn();
        $this->postJson('/api/items', [...$this->body(), 'unitPrice' => -1])->assertUnprocessable();
        $this->getJson('/api/items/sku-preview?hasShelfLife=0')->assertJsonPath('data.sku', 'WBA-NEX-001');
        DB::table('product_sku_sequences')->where('prefix', 'WBA-NEX-')->update(['next_number' => 999]);
        $this->postJson('/api/items', $this->body())->assertCreated()->assertJsonPath('data.sku', 'WBA-NEX-999');
        $this->postJson('/api/items', $this->body())->assertCreated()->assertJsonPath('data.sku', 'WBA-NEX-1000');
    }

    public function test_existing_skus_survive_editing_and_generated_prefixes_cannot_be_supplied(): void
    {
        $this->signIn();
        $result = $this->postJson('/api/items', $this->body())->assertCreated();
        $id = $result->json('data.id');
        $body = $this->body(true);
        unset($body['physicalOnHand']);
        $this->putJson('/api/items/'.$id, $body)->assertOk()->assertJsonPath('data.sku', 'WBA-NEX-001');
        $this->putJson('/api/items/'.$id, [...$body, 'sku' => 'CHANGED'])->assertUnprocessable();
        $this->postJson('/api/items', [...$this->body(), 'sku' => 'WBA-NEX-700'])->assertUnprocessable();
        $this->postJson('/api/items', [...$this->body(), 'sku' => 'LEGACY-001', 'category' => 'B'])->assertCreated()->assertJsonPath('data.sku', 'LEGACY-001');
    }

    public function test_preview_is_admin_only_and_requires_a_boolean(): void
    {
        $this->getJson('/api/items/sku-preview?hasShelfLife=0')->assertUnauthorized();
        foreach (['warehouse', 'sales', 'purchasing'] as $role) {
            $this->signIn($role);
            $this->getJson('/api/items/sku-preview?hasShelfLife=0')->assertForbidden();
        }
        $this->signIn();
        $this->getJson('/api/items/sku-preview?hasShelfLife=invalid')->assertUnprocessable();
    }

    public function test_migration_initializes_sequences_from_existing_and_archived_codes(): void
    {
        Item::create(['name' => 'Existing', 'sku' => 'WBA-NEX-007', 'warehouse_bin' => 'B']);
        Item::create(['name' => 'Archived', 'sku' => 'WBA-EXP-025', 'warehouse_bin' => 'B', 'archived_at' => now()]);
        Schema::drop('product_sku_sequences');
        $migration = require database_path('migrations/2026_10_13_154500_create_product_sku_sequences_table.php');
        $migration->up();
        $this->signIn();
        $this->getJson('/api/items/sku-preview?hasShelfLife=0')->assertJsonPath('data.sku', 'WBA-NEX-008');
        $this->getJson('/api/items/sku-preview?hasShelfLife=1')->assertJsonPath('data.sku', 'WBA-EXP-026');
    }
}
