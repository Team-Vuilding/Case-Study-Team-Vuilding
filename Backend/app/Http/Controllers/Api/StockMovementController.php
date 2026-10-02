<?php

namespace App\Http\Controllers\Api;

use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StockMovementController extends ApiController
{
    public function stock(Request $request): JsonResponse
    {
        $data = $request->validate(['code' => 'required|string|max:80', 'quantity' => 'required|integer|min:1|max:100000000',
            'type' => ['sometimes', Rule::in(['stock_in', 'stock_out'])], 'expiresAt' => 'nullable|date|after_or_equal:today',
            'lot' => 'nullable|string|max:120|unique:batches,lot', 'reference' => 'nullable|string|max:120']);
        $item = DB::transaction(function () use ($request, $data) {
            $item = Item::where('sku', $data['code'])->lockForUpdate()->firstOrFail();
            $type = $data['type'] ?? 'stock_in';
            $quantity = (int) $data['quantity'];
            if ($type === 'stock_out') {
                abort_if($quantity > $item->physical_on_hand - $item->reserved - $item->allocated, 422, 'Insufficient available stock.');
                if ($item->shelf_life_months) {
                    $batches = DB::table('batches')->where('item_id', $item->id)->where('quantity', '>', 0)
                        ->where('expires_at', '>=', today()->toDateString())->orderBy('expires_at')->orderBy('received_at')->get();
                    abort_if($batches->sum('quantity') < $quantity, 422, 'Insufficient unexpired batch stock.');
                    $remaining = $quantity;
                    foreach ($batches as $batch) {
                        $take = min($remaining, $batch->quantity);
                        DB::table('batches')->where('id', $batch->id)->decrement('quantity', $take);
                        $remaining -= $take;
                        if (! $remaining) {
                            break;
                        }
                    }
                }
            } else {
                abort_if($item->shelf_life_months && empty($data['expiresAt']), 422, 'Enter the actual batch expiry date.');
                $this->receiveBatch($item, $quantity, $data['expiresAt'] ?? null, $data['lot'] ?? null);
            }
            $delta = $type === 'stock_in' ? $quantity : -$quantity;
            $item->increment('physical_on_hand', $delta);
            $item->increment('paper_spreadsheet_count', $delta);
            $this->movement($request, $item, $type, $quantity, $data['reference'] ?? null);
            $this->audit($request, $type === 'stock_in' ? 'QR_STOCK_RECEIVED' : 'Stock dispatched',
                $quantity.' units '.($type === 'stock_in' ? 'received for ' : 'dispatched for ').$item->name, $item->sku);

            return $item->fresh();
        }, 3);

        return response()->json(['data' => $this->itemData($item)], 201);
    }

    public function scan(Request $request): JsonResponse
    {
        $data = $request->validate(['code' => 'required|string|max:80']);

        return response()->json(['data' => $this->itemData(Item::where('sku', $data['code'])->firstOrFail())]);
    }

    public function movements(Request $request): JsonResponse
    {
        return response()->json(['data' => DB::table('stock_movements')->join('items', 'items.id', '=', 'stock_movements.item_id')
            ->select('stock_movements.*', 'items.sku', 'items.name')->orderByDesc('stock_movements.id')->limit(1000)->get()]);
    }
}
