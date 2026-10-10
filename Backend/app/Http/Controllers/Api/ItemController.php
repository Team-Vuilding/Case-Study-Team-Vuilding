<?php

namespace App\Http\Controllers\Api;

use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ItemController extends ApiController
{
    public function items(Request $request): JsonResponse
    {
        return response()->json(['data' => Item::orderBy('name')->get()->map(fn ($item) => $this->itemData($item))]);
    }

    public function item(Request $request, Item $item): JsonResponse
    {
        return response()->json(['data' => $this->itemData($item)]);
    }

    public function saveItem(Request $request, ?Item $item = null): JsonResponse
    {
        $data = $request->validate(['name' => 'required|string|max:200',
            'sku' => ['required', 'string', 'max:80', Rule::unique('items')->ignore($item?->id)],
            'category' => ['required', Rule::in(['A', 'B', 'C'])], 'fsn' => ['required', Rule::in(['Fast', 'Normal', 'Slow', 'Non-moving'])],
            'unitPrice' => 'required|numeric|min:0|max:9999999999', 'warehouseBin' => 'required|string|max:120',
            'physicalOnHand' => $item ? 'prohibited' : 'required|integer|min:0|max:100000000',
            'hasShelfLife' => 'required|boolean', 'shelfLifeMonths' => 'nullable|required_if:hasShelfLife,true|integer|min:1|max:120',
            'isSeasonal' => 'sometimes|boolean', 'storageCostPerMonth' => 'sometimes|numeric|min:0|max:99999999.99',
            'expiresAt' => 'nullable|date|after_or_equal:today']);
        abort_if(! $item && $data['hasShelfLife'] && $data['physicalOnHand'] > 0 && empty($data['expiresAt']), 422, 'Enter the actual initial batch expiry date.');
        $saved = DB::transaction(function () use ($request, $data, $item) {
            $saved = $item ?? new Item;
            $saved->fill(['name' => trim($data['name']), 'sku' => trim($data['sku']), 'category_classification' => $data['category'],
                'fsn' => $data['fsn'], 'unit_price' => $data['unitPrice'], 'warehouse_bin' => trim($data['warehouseBin']),
                'shelf_life_months' => $data['hasShelfLife'] ? $data['shelfLifeMonths'] : null,
                'is_seasonal' => $data['isSeasonal'] ?? false, 'storage_cost_per_month' => $data['storageCostPerMonth'] ?? 0]);
            if (! $item) {
                $saved->physical_on_hand = $saved->paper_spreadsheet_count = $data['physicalOnHand'];
            }
            $saved->save();
            if (! $item && $saved->physical_on_hand > 0) {
                $this->movement($request, $saved, 'stock_in', $saved->physical_on_hand, 'Initial stock');
                $this->receiveBatch($saved, $saved->physical_on_hand, $data['expiresAt'] ?? null);
            }
            $this->audit($request, $item ? 'Product updated' : 'PRODUCT_CATALOG_ADDED', $saved->name.' saved in the catalog.', $saved->sku);

            return $saved;
        });

        return response()->json(['data' => $this->itemData($saved)], $item ? 200 : 201);
    }

    public function deleteItem(Request $request, Item $item): JsonResponse
    {
        abort_if($item->stockMovements()->exists() || $item->purchaseOrderItems()->exists() || $item->countRecords()->exists() || $item->physical_on_hand > 0, 422, 'Products with stock or history must be retained.');
        $this->audit($request, 'Product deleted', 'Removed '.$item->name, $item->sku);
        $item->delete();

        return response()->json(['message' => 'Product removed.']);
    }
}
