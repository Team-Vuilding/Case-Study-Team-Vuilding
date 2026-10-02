<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * DashboardController
 *
 * Provides aggregated KPIs, alerts, and system summaries tailored to each user role.
 */
class DashboardController extends Controller
{
    /**
     * Get role-tailored dashboard metrics and KPIs.
     *
     * Responses should vary by role:
     * - Admin: System overview, valuation, pending approvals, user count
     * - Warehouse Staff: Low-stock alerts, pending stock movements, count discrepancies
     * - Purchasing Manager: Low-stock reorder alerts, pending POs, monthly procurement spending
     * - Sales Staff: Total active items, available-to-promise units, top selling products
     */
    public function metrics(Request $request): JsonResponse
    {
        // TODO: Inspect user role and query respective statistical summaries
        return response()->json([
            'message' => 'Endpoint scaffolded: dashboard.metrics (no functionality yet)',
            'guide' => 'Aggregate role-specific summary cards, stock health, and quick stats.',
        ]);
    }

    /**
     * Get items that have breached safety stock or reorder point thresholds.
     */
    public function lowStockAlerts(): JsonResponse
    {
        // TODO: Query items where physical_on_hand <= safety_stock
        return response()->json([
            'message' => 'Endpoint scaffolded: dashboard.lowStockAlerts (no functionality yet)',
        ]);
    }

    /**
     * Get pending items requiring executive or manager action.
     */
    public function pendingApprovals(): JsonResponse
    {
        // TODO: Query draft/pending purchase orders or open stock count reconciliations
        return response()->json([
            'message' => 'Endpoint scaffolded: dashboard.pendingApprovals (no functionality yet)',
        ]);
    }
}
