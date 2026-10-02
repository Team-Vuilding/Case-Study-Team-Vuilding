<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AuthController
 *
 * Handles authentication and session operations for WBA users.
 * Supported roles: Admin, Warehouse Staff, Purchasing Manager, Sales Staff.
 */
class AuthController extends Controller
{
    /**
     * Authenticate user credentials and return an API token or session.
     *
     * Expected Request Payload:
     * - email: string (required)
     * - password: string (required)
     *
     * Expected Response:
     * - 200 OK: { user: {...}, token: string, message: "Login successful" }
     * - 401 Unauthorized: { error: "Invalid credentials" }
     *
     * Guide: In production, validate credentials against the `users` table and return
     * a Sanctum personal access token or initialize a secure session.
     */
    public function login(Request $request): JsonResponse
    {
        // TODO: Validate credentials, verify hash, and generate auth token
        return response()->json([
            'message' => 'Endpoint scaffolded: auth.login (no functionality yet)',
            'guide' => 'Validate email + password, then return auth token with user role permissions.',
        ]);
    }

    /**
     * Log out current user and revoke active tokens.
     *
     * Expected Headers:
     * - Authorization: Bearer <token>
     *
     * Expected Response:
     * - 200 OK: { message: "Successfully logged out" }
     */
    public function logout(Request $request): JsonResponse
    {
        // TODO: Invalidate current access token / session
        return response()->json([
            'message' => 'Endpoint scaffolded: auth.logout (no functionality yet)',
        ]);
    }

    /**
     * Get the authenticated user's profile and active permissions.
     *
     * Expected Headers:
     * - Authorization: Bearer <token>
     *
     * Expected Response:
     * - 200 OK: { user: { id, name, email, role, department, accessLevel, avatar } }
     */
    public function me(Request $request): JsonResponse
    {
        // TODO: Return currently authenticated user data and assigned capabilities
        return response()->json([
            'message' => 'Endpoint scaffolded: auth.me (no functionality yet)',
        ]);
    }
}
