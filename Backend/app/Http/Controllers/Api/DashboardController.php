<?php

namespace App\Http\Controllers\Api;

use App\Models\Item;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends ApiController
{
    public function batches(Request $request): JsonResponse
    {
        return response()->json(['data' => DB::table('batches')->join('items', 'items.id', '=', 'batches.item_id')
            ->where('batches.quantity', '>', 0)->select('batches.*', 'items.name', 'items.sku')->orderBy('batches.expires_at')->get()->map(fn ($batch) => [
                'id' => $batch->id, 'lot' => $batch->lot, 'product' => $batch->name, 'sku' => $batch->sku,
                'quantity' => $batch->quantity, 'location' => $batch->location, 'receivedAt' => $batch->received_at,
                'expiresAt' => $batch->expires_at, 'daysLeft' => (int) today()->diffInDays(Carbon::parse($batch->expires_at), false),
            ])]);
    }

    public function metrics(Request $request): JsonResponse
    {
        $items = Item::active()->get();
        $data = ['products' => $items->count(), 'onHand' => $items->sum('physical_on_hand'), 'reserved' => $items->sum('reserved'),
            'allocated' => $items->sum('allocated'), 'available' => $items->sum(fn ($item) => max(0, $item->physical_on_hand - $item->reserved - $item->allocated)),
            'stockouts' => $items->filter(fn ($item) => $item->physical_on_hand - $item->reserved - $item->allocated <= 0)->count()];
        if ($request->user()->access_level !== 'sales') {
            $data['monthlyStorageCost'] = $items->sum(fn ($item) => $item->physical_on_hand * (float) $item->storage_cost_per_month);
            $data['mismatchUnits'] = $items->sum(fn ($item) => abs($item->physical_on_hand - $item->paper_spreadsheet_count));
            $data['expiryRisk'] = (float) DB::table('batches')->join('items', 'items.id', '=', 'batches.item_id')->where('batches.quantity', '>', 0)
                ->where('expires_at', '<=', today()->addDays(30)->toDateString())->selectRaw('COALESCE(SUM(batches.quantity * items.unit_price), 0) as total')->value('total');
        }

        return response()->json(['data' => $data]);
    }

    public function activity(Request $request): JsonResponse
    {
        $movements = DB::table('stock_movements')->whereYear('created_at', now()->year)->get();

        return response()->json(['data' => collect(range(1, 12))->map(function ($month) use ($movements) {
            $rows = $movements->filter(fn ($row) => Carbon::parse($row->created_at)->month === $month);

            return ['month' => Carbon::create(null, $month, 1)->format('M'), 'received' => $rows->where('type', 'stock_in')->sum('quantity'), 'dispatched' => $rows->where('type', 'stock_out')->sum('quantity')];
        })]);
    }

    public function alerts(Request $request): JsonResponse
    {
        $alerts = Item::active()->get()->filter(fn ($item) => $item->physical_on_hand <= $item->safety_stock_off_peak)->map(fn ($item) => [
            'id' => 'stock-'.$item->id, 'title' => 'Low stock: '.$item->name, 'severity' => 'warning',
            'description' => $item->physical_on_hand.' units on hand; safety stock '.$item->safety_stock_off_peak.'.',
        ])->values();
        if ($request->user()->access_level !== 'sales') {
            foreach ($this->batches($request)->getData(true)['data'] as $batch) {
                if ($batch['daysLeft'] <= 30) {
                    $alerts->push(['id' => 'expiry-'.$batch['id'], 'title' => 'Batch expiry: '.$batch['product'], 'severity' => 'critical', 'description' => $batch['lot'].' expires '.$batch['expiresAt'].'.']);
                }
            }
        }

        return response()->json(['data' => $alerts]);
    }
}
