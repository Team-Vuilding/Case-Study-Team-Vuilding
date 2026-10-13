<?php

namespace App\Http\Controllers\Api;

use App\Models\InventoryReport;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class InventoryReportController extends ApiController
{
    public function index(Request $request, Item $item): JsonResponse
    {
        $request->validate(['page' => 'sometimes|integer|min:1|max:1000000']);
        $reports = $item->inventoryReports()->orderByDesc('id')->paginate(20);

        return response()->json(['data' => $reports->getCollection()->map(fn (InventoryReport $report) => $this->reportData($report)),
            'meta' => ['currentPage' => $reports->currentPage(), 'lastPage' => $reports->lastPage(), 'total' => $reports->total()]]);
    }

    public function store(Request $request, Item $item): JsonResponse
    {
        $data = $request->validate(['kind' => ['required', Rule::in(['info', 'mismatch'])], 'message' => 'required|string|min:3|max:1000',
            'countedQuantity' => ['nullable', 'integer', 'min:0', 'max:100000000', Rule::prohibitedIf($request->input('kind') !== 'mismatch')]]);
        $report = DB::transaction(function () use ($request, $item, $data) {
            $item = Item::whereKey($item->id)->lockForUpdate()->firstOrFail();
            abort_if($item->archived_at, 422, 'Restore this product before adding warehouse reports.');
            $report = InventoryReport::create(['item_id' => $item->id, 'user_id' => $request->user()->id, 'actor' => $request->user()->name,
                'kind' => $data['kind'], 'message' => $data['message'], 'recorded_quantity' => $item->physical_on_hand,
                'ledger_quantity' => $item->paper_spreadsheet_count, 'counted_quantity' => $data['countedQuantity'] ?? null]);
            $description = $item->name.': '.$data['message'];
            if ($report->counted_quantity !== null) {
                $description .= ' Counted '.$report->counted_quantity.'; ledger '.$report->ledger_quantity.'.';
            }
            $this->audit($request, $data['kind'] === 'mismatch' ? 'Warehouse mismatch' : 'Warehouse note', $description, $item->sku,
                $data['kind'] === 'mismatch' ? 'warning' : 'info');

            return $report;
        }, 3);

        return response()->json(['data' => $this->reportData($report), 'message' => 'Warehouse report saved.'], 201);
    }

    private function reportData(InventoryReport $report): array
    {
        return ['id' => $report->id, 'kind' => $report->kind, 'message' => $report->message, 'actor' => $report->actor,
            'createdAt' => $report->created_at->toISOString(), 'recordedQuantity' => $report->recorded_quantity, 'ledgerQuantity' => $report->ledger_quantity,
            'countedQuantity' => $report->counted_quantity, 'variance' => $report->counted_quantity === null ? null : $report->counted_quantity - $report->ledger_quantity];
    }
}
