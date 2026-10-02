<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * CategoryController
 *
 * Manages item categories and catalog classification.
 *
 * Authorization:
 * - Admin: Full CRUD
 * - All other roles: Read-only access
 */
class CategoryController extends Controller
{
    /**
     * List all categories.
     */
    public function index(): JsonResponse
    {
        // TODO: Return all categories with linked item counts
        return response()->json([
            'message' => 'Endpoint scaffolded: categories.index (no functionality yet)',
        ]);
    }

    /**
     * Create a new category (Admin only).
     */
    public function store(Request $request): JsonResponse
    {
        // TODO: Validate name & code, persist category
        return response()->json([
            'message' => 'Endpoint scaffolded: categories.store (no functionality yet)',
        ], 201);
    }

    /**
     * Update an existing category (Admin only).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        // TODO: Apply updates
        return response()->json([
            'message' => 'Endpoint scaffolded: categories.update (no functionality yet)',
            'category_id' => $id,
        ]);
    }

    /**
     * Remove a category (Admin only).
     */
    public function destroy(string $id): JsonResponse
    {
        // TODO: Ensure no active items belong to category before removing
        return response()->json([
            'message' => 'Endpoint scaffolded: categories.destroy (no functionality yet)',
            'category_id' => $id,
        ]);
    }
}
