<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * StockMovementController
 *
 * Warehouse operations for receiving and shipping movements.
 * Required per PROJECT_SCOPE.md:
 * - Restricted to Warehouse Staff & Admin
 * - Barcode/QR scanning integration
 * - Traceable adjustments for any inventory update
 */
class StockMovementController extends Controller
{
    /**
     * List recent stock movements (receiving/shipping audit history).
     *
     * Authorization: Warehouse Staff (their movements) & Admin (global).
     */
    public function index(Request $request): JsonResponse
    {
        // TODO: Query stock_movements with relations to item and user
        return response()->json([
            'message' => 'Endpoint scaffolded: stockMovements.index (no functionality yet)',
            'guide' => 'Fetch traceable Stock In / Stock Out history.',
        ]);
    }

    /**
     * Record a new Stock In or Stock Out movement.
     *
     * Expected Request Payload:
     * - item_id: integer (required)
     * - type: string ('stock_in' | 'stock_out') (required)
     * - quantity: integer (required, > 0)
     * - reference_number: string (optional, e.g. PO number)
     * - scanned_barcode: string (optional, barcode value if scanned)
     * - notes: string (optional)
     *
     * Business Logic Guide:
     * - For stock_in: increment `items.physical_on_hand`
     * - For stock_out: verify available stock and decrement `items.physical_on_hand`
     */
    public function store(Request $request): JsonResponse
    {
        // TODO: Validate movement, update item physicalOnHand in a DB transaction, and log movement
        return response()->json([
            'message' => 'Endpoint scaffolded: stockMovements.store (no functionality yet)',
        ], 201);
    }

    /**
     * Scan Barcode or QR Code to quickly identify or receive/ship an item.
     *
     * Authorization: Restricted strictly to Warehouse Staff and Admin.
     *
     * Expected Request Payload:
     * - barcode: string (required)
     * - action: string ('lookup' | 'stock_in' | 'stock_out')
     *
     * Expected Response:
     * - 200 OK: { matched_item: {...}, match_type: 'exact'|'fuzzy', confidence: 0.95 }
     */
    public function scanBarcode(Request $request): JsonResponse
    {
        // TODO: Lookup SKU or barcode against items table and return match details
        return response()->json([
            'message' => 'Endpoint scaffolded: stockMovements.scanBarcode (no functionality yet)',
            'guide' => 'Process QR/barcode scan event for Warehouse receiving/shipping workflow.',
        ]);
    }
}
