<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ApiController extends Controller
{
    protected const ROLES = ['admin' => ['Admin', 'System & User Management'], 'warehouse' => ['Warehouse Staff', 'Warehouse Operations'], 'purchasing' => ['Purchasing Manager', 'Procurement & Supply Chain'], 'sales' => ['Sales Staff', 'Sales & Customer Service']];

    protected function account(User $user): array
    {
        $status = $user->account_status ?? ($user->is_active ? 'active' : 'deactivated');

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'accessLevel' => $user->access_level,
            'role' => $user->role,
            'department' => $user->department,
            'initials' => $user->initials,
            'avatar' => $user->avatar,
            'status' => $status,
            'accountStatus' => $status,
            'isActive' => (bool) $user->is_active,
            'deactivatedAt' => $user->deactivated_at?->toISOString(),
            'deletionAt' => $user->deletion_at?->toISOString(),
            'remainingSeconds' => $user->remainingSeconds(),
            'remainingDays' => $user->remainingDays(),
            'canReactivate' => $user->deletion_at ? $user->deletion_at->isFuture() : false,
        ];
    }

    protected function audit(Request $request, string $event, string $description, ?string $target = null): void
    {
        DB::table('audit_events')->insert(['user_id' => $request->user()->id, 'actor' => $request->user()->name,
            'event_type' => $event, 'description' => $description, 'target' => $target, 'severity' => 'good', 'created_at' => now()]);
    }

    protected function itemData(Item $item): array
    {
        $archiveBlockReason = $item->archiveBlockReason();

        return ['id' => $item->id, 'sku' => $item->sku, 'name' => $item->name, 'category' => $item->category_classification,
            'fsn' => $item->fsn, 'unitPrice' => (float) $item->unit_price, 'physicalOnHand' => $item->physical_on_hand,
            'reserved' => $item->reserved, 'allocated' => $item->allocated, 'paperSpreadsheetCount' => $item->paper_spreadsheet_count,
            'warehouseBin' => $item->warehouse_bin, 'shelfLifeMonths' => $item->shelf_life_months,
            'isSeasonal' => $item->is_seasonal, 'status' => $item->status, 'statusSeverity' => $item->status_severity,
            'isArchived' => (bool) $item->archived_at, 'archivedAt' => $item->archived_at?->toISOString(),
            'archivedBy' => $item->archived_by_name, 'archiveReason' => $item->archive_reason,
            'canArchive' => $archiveBlockReason === null, 'archiveBlockReason' => $archiveBlockReason,
            'canDelete' => $item->canDeletePermanently()];
    }

    protected function movement(Request $request, Item $item, string $type, int $quantity, ?string $reference = null): void
    {
        DB::table('stock_movements')->insert(['item_id' => $item->id, 'user_id' => $request->user()->id, 'type' => $type,
            'quantity' => $quantity, 'reference_number' => $reference, 'scanned_barcode' => $request->input('code'),
            'created_at' => now(), 'updated_at' => now()]);
    }

    protected function receiveBatch(Item $item, int $quantity, ?string $expiresAt = null, ?string $lot = null): void
    {
        if (! $item->shelf_life_months || ! $quantity) {
            return;
        }
        DB::table('batches')->insert(['item_id' => $item->id, 'lot' => $lot ?? 'LOT-'.Str::uuid(), 'location' => $item->warehouse_bin,
            'quantity' => $quantity, 'received_at' => today(), 'expires_at' => $expiresAt,
            'created_at' => now(), 'updated_at' => now()]);
    }
}
