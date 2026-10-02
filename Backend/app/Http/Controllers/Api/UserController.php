<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * UserController
 *
 * User management and role permission administration.
 * Authorization: Restricted strictly to Admin role.
 */
class UserController extends Controller
{
    /**
     * List all system users with their roles and status.
     *
     * Authorization: Admin only.
     *
     * Expected Response:
     * - 200 OK: { data: [ { id, name, email, role, department, access_level, is_active } ] }
     */
    public function index(): JsonResponse
    {
        // TODO: Query users table with pagination or filter by role
        return response()->json([
            'message' => 'Endpoint scaffolded: users.index (no functionality yet)',
            'guide' => 'Fetch all registered users. Restricted to Admin role.',
        ]);
    }

    /**
     * Create a new user account with role assignment.
     *
     * Expected Request Payload:
     * - name: string (required)
     * - email: string (required, unique)
     * - password: string (required, min:8)
     * - role: string ('Admin', 'Warehouse Staff', 'Purchasing Manager', 'Sales Staff')
     * - department: string (optional)
     *
     * Expected Response:
     * - 201 Created: { user: {...}, message: "User created successfully" }
     */
    public function store(Request $request): JsonResponse
    {
        // TODO: Validate user input, hash password, and persist record
        return response()->json([
            'message' => 'Endpoint scaffolded: users.store (no functionality yet)',
        ], 201);
    }

    /**
     * Retrieve single user details.
     */
    public function show(string $id): JsonResponse
    {
        // TODO: Fetch user by primary key
        return response()->json([
            'message' => 'Endpoint scaffolded: users.show (no functionality yet)',
            'user_id' => $id,
        ]);
    }

    /**
     * Update user details or reassign system roles.
     *
     * Expected Request Payload:
     * - name: string (optional)
     * - role: string (optional)
     * - department: string (optional)
     * - is_active: boolean (optional)
     */
    public function update(Request $request, string $id): JsonResponse
    {
        // TODO: Validate updates and apply changes
        return response()->json([
            'message' => 'Endpoint scaffolded: users.update (no functionality yet)',
            'user_id' => $id,
        ]);
    }

    /**
     * Remove or deactivate a user account.
     */
    public function destroy(string $id): JsonResponse
    {
        // TODO: Soft delete or deactivate user
        return response()->json([
            'message' => 'Endpoint scaffolded: users.destroy (no functionality yet)',
            'user_id' => $id,
        ]);
    }

    /**
     * Retrieve global user activity & audit logs.
     *
     * Authorization: Admin only.
     * Note: Per PROJECT_SCOPE.md, Warehouse Staff must NOT access global audit logs.
     */
    public function activityLogs(): JsonResponse
    {
        // TODO: Return paginated audit events
        return response()->json([
            'message' => 'Endpoint scaffolded: users.activityLogs (no functionality yet)',
            'guide' => 'Expose system audit trails to Admin only.',
        ]);
    }
}
