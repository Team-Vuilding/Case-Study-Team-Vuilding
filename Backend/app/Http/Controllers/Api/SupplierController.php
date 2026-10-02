<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * SupplierController
 *
 * Supplier directory management for procurement.
 * Authorization: Purchasing Manager & Admin.
 */
class SupplierController extends Controller
{
    /**
     * List all suppliers and profiles.
     */
    public function index(): JsonResponse
    {
        // TODO: Query suppliers table
        return response()->json([
            'message' => 'Endpoint scaffolded: suppliers.index (no functionality yet)',
        ]);
    }

    /**
     * Create a new supplier profile.
     */
    public function store(Request $request): JsonResponse
    {
        // TODO: Validate supplier details and save
        return response()->json([
            'message' => 'Endpoint scaffolded: suppliers.store (no functionality yet)',
        ], 201);
    }

    /**
     * Update supplier profile.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        // TODO: Apply updates
        return response()->json([
            'message' => 'Endpoint scaffolded: suppliers.update (no functionality yet)',
            'supplier_id' => $id,
        ]);
    }

    /**
     * Delete supplier profile.
     */
    public function destroy(string $id): JsonResponse
    {
        // TODO: Verify no active open POs before deleting
        return response()->json([
            'message' => 'Endpoint scaffolded: suppliers.destroy (no functionality yet)',
            'supplier_id' => $id,
        ]);
    }
}
