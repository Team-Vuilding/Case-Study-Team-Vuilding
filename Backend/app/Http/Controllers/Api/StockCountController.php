<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * StockCountController
 *
 * Physical inventory counts, discrepancy auditing, and reconciliation workflows.
 * Authorization: Warehouse Staff & Admin.
 */
class StockCountController extends Controller
{
    /**
     * List all physical count sessions and their audit statuses.
     */
    public function index(): JsonResponse
    {
        // TODO: Query stock_counts with relations
        return response()->json([
            'message' => 'Endpoint scaffolded: stockCounts.index (no functionality yet)',
        ]);
    }

    /**
     * Start a new physical count session.
     *
     * Expected Request Payload:
     * - count_reference: string (optional, auto-generated if blank)
     * - notes: string (optional)
     */
    public function store(Request $request): JsonResponse
    {
        // TODO: Create stock_count session and snapshot current item system_quantities
        return response()->json([
            'message' => 'Endpoint scaffolded: stockCounts.store (no functionality yet)',
        ], 201);
    }

    /**
     * Reconcile discrepancies and update physical inventory balances.
     *
     * Authorization: Admin oversight required for large discrepancy approvals.
     *
     * Expected Request Payload:
     * - adjustments: array of { item_id, counted_quantity, reason }
     *
     * Expected Effect:
     * - Updates item `physical_on_hand`
     * - Creates `reconciliation_logs` entries for full auditability
     */
    public function reconcile(Request $request, string $id): JsonResponse
    {
        // TODO: Validate adjustments, execute DB transaction, log reconciliation
        return response()->json([
            'message' => 'Endpoint scaffolded: stockCounts.reconcile (no functionality yet)',
            'stock_count_id' => $id,
            'guide' => 'Reconcile counted variance with items on-hand and create audit logs.',
        ]);
    }
}
