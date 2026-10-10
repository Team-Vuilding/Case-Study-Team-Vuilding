<?php

namespace App\Http\Controllers\Api;

use App\Models\Item;
use App\Models\PurchaseOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PurchaseOrderController extends ApiController
{
    public function orders(Request $request): JsonResponse
    {
        return response()->json(['data' => PurchaseOrder::with(['supplier', 'items.item'])->latest()->get()->map(function ($order) use ($request) {
            $canViewCosts = in_array($request->user()->access_level, ['admin', 'purchasing'], true);

            return ['id' => $order->id, 'number' => $order->po_number, 'supplier' => $order->supplier->name, 'status' => $order->status,
                'orderDate' => $order->order_date?->toDateString(), 'expectedDelivery' => $order->expected_delivery_date?->toDateString(),
                'notes' => $order->notes, 'totalCost' => $canViewCosts ? (float) $order->total_amount : null,
                'lines' => $order->items->map(fn ($line) => ['id' => $line->id, 'sku' => $line->item->sku, 'product' => $line->item->name,
                    'quantity' => $line->quantity_ordered, 'received' => $line->quantity_received, 'unitCost' => $canViewCosts ? (float) $line->unit_price : null])];
        })]);
    }

    public function createOrder(Request $request): JsonResponse
    {
        $data = $request->validate(['supplier_id' => 'required|exists:suppliers,id', 'expected_delivery_date' => 'nullable|date|after_or_equal:today',
            'notes' => 'nullable|string|max:1000', 'items' => 'required|array|min:1|max:100', 'items.*.item_id' => 'required|distinct|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1|max:1000000', 'items.*.unit_price' => 'required|numeric|min:0|max:100000000']);
        $total = collect($data['items'])->sum(fn ($line) => round($line['quantity'] * $line['unit_price'], 2));
        abort_if($total > 9999999999.99, 422, 'Purchase order total exceeds the supported amount.');
        $id = DB::transaction(function () use ($request, $data, $total) {
            $id = DB::table('purchase_orders')->insertGetId(['po_number' => 'PO-'.Str::uuid(), 'supplier_id' => $data['supplier_id'],
                'user_id' => $request->user()->id, 'status' => 'pending_approval', 'order_date' => today(),
                'expected_delivery_date' => $data['expected_delivery_date'] ?? null, 'notes' => $data['notes'] ?? null,
                'total_amount' => $total, 'created_at' => now(), 'updated_at' => now()]);
            foreach ($data['items'] as $line) {
                DB::table('purchase_order_items')->insert(['purchase_order_id' => $id, 'item_id' => $line['item_id'], 'quantity_ordered' => $line['quantity'],
                    'unit_price' => $line['unit_price'], 'subtotal' => round($line['quantity'] * $line['unit_price'], 2), 'created_at' => now(), 'updated_at' => now()]);
            }
            $this->audit($request, 'Purchase order created', 'Purchase order '.$id.' submitted for approval.');

            return $id;
        });

        return response()->json(['id' => $id], 201);
    }

    public function orderStatus(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(['approved', 'cancelled', 'received'])], 'expiresAt' => 'nullable|date|after_or_equal:today']);
        DB::transaction(function () use ($request, $id, $data) {
            $order = DB::table('purchase_orders')->where('id', $id)->lockForUpdate()->first();
            abort_unless($order, 404);
            $status = $data['status'];
            $role = $request->user()->access_level;
            abort_if(($status === 'approved' && $role !== 'admin') || ($status === 'received' && ! in_array($role, ['admin', 'warehouse'], true))
                || ($status === 'cancelled' && ! in_array($role, ['admin', 'purchasing'], true)), 403);
            abort_if(($status === 'approved' && $order->status !== 'pending_approval') || ($status === 'received' && $order->status !== 'approved')
                || ($status === 'cancelled' && ! in_array($order->status, ['draft', 'pending_approval', 'approved'], true)), 422, 'Invalid order status transition.');
            if ($status === 'received') {
                foreach (DB::table('purchase_order_items')->where('purchase_order_id', $id)->get() as $line) {
                    $item = Item::whereKey($line->item_id)->lockForUpdate()->firstOrFail();
                    abort_if($item->shelf_life_months && empty($data['expiresAt']), 422, 'An actual expiry date is required for perishable deliveries.');
                    $quantity = $line->quantity_ordered - $line->quantity_received;
                    abort_if(max($item->physical_on_hand, $item->paper_spreadsheet_count) + $quantity > 2147483647, 422, 'Receipt exceeds the supported stock quantity.');
                    $item->increment('physical_on_hand', $quantity);
                    $item->increment('paper_spreadsheet_count', $quantity);
                    $this->receiveBatch($item, $quantity, $data['expiresAt'] ?? null);
                    $this->movement($request, $item, 'stock_in', $quantity, $order->po_number);
                    DB::table('purchase_order_items')->where('id', $line->id)->update(['quantity_received' => $line->quantity_ordered]);
                }
            }
            DB::table('purchase_orders')->where('id', $id)->update(['status' => $status, 'updated_at' => now(),
                'approved_by_id' => $status === 'approved' ? $request->user()->id : $order->approved_by_id]);
            $this->audit($request, 'Purchase order '.$status, $order->po_number.' '.$status.'.');
        }, 3);

        return response()->json(['message' => 'Order updated.']);
    }
}
