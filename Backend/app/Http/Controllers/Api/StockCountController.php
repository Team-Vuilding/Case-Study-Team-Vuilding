<?php

namespace App\Http\Controllers\Api;

use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StockCountController extends ApiController
{
    public function reconcile(Request $request, Item $item): JsonResponse
    {
        $data = $request->validate(['quantity' => 'required|integer|min:0|max:100000000', 'reason' => 'required|string|max:500']);
        DB::transaction(function () use ($request, $item, $data) {
            $item = Item::whereKey($item->id)->lockForUpdate()->firstOrFail();
            abort_if($item->archived_at, 422, 'Restore this product before recording a stock count.');
            abort_if($data['quantity'] < $item->reserved + $item->allocated, 422, 'Count is below committed stock. Resolve reservations first.');
            abort_if($item->shelf_life_months && $data['quantity'] !== $item->physical_on_hand, 422, 'Perishable quantity changes require batch-level adjustments.');
            $previous = $item->physical_on_hand;
            $id = DB::table('stock_counts')->insertGetId(['count_reference' => 'COUNT-'.Str::uuid(), 'user_id' => $request->user()->id,
                'status' => 'reconciled', 'started_at' => now(), 'completed_at' => now(), 'notes' => $data['reason'], 'created_at' => now(), 'updated_at' => now()]);
            DB::table('stock_count_items')->insert(['stock_count_id' => $id, 'item_id' => $item->id,
                'system_quantity' => $item->paper_spreadsheet_count, 'counted_quantity' => $data['quantity'],
                'variance' => $data['quantity'] - $item->paper_spreadsheet_count, 'created_at' => now(), 'updated_at' => now()]);
            DB::table('reconciliation_logs')->insert(['stock_count_id' => $id, 'item_id' => $item->id, 'user_id' => $request->user()->id,
                'previous_quantity' => $previous, 'adjusted_quantity' => $data['quantity'], 'variance' => $data['quantity'] - $previous,
                'reason' => $data['reason'], 'created_at' => now(), 'updated_at' => now()]);
            $item->update(['physical_on_hand' => $data['quantity'], 'paper_spreadsheet_count' => $data['quantity']]);
            $this->audit($request, 'LEDGER_RECONCILED', $item->name.' counted: '.$data['quantity'].'. '.$data['reason'], $item->sku);
        }, 3);

        return response()->json(['data' => $this->itemData($item->fresh())]);
    }

    public function counts(Request $request): JsonResponse
    {
        return response()->json(['data' => DB::table('stock_counts')->orderByDesc('id')->get()]);
    }
}
