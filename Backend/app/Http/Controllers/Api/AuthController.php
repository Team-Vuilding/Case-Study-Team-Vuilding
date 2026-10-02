<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends ApiController
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|string', 'accessLevel' => ['required', Rule::in(array_keys(self::ROLES))]]);
        $user = User::where('email', strtolower(trim($data['email'])))->first();
        if (! $user || ! Hash::check($data['password'], $user->password) || ! $user->is_active || $user->access_level !== $data['accessLevel']) {
            return response()->json(['message' => 'The credentials do not match an active account for this role.'], 422);
        }
        $token = Str::random(64);
        DB::table('api_tokens')->where('expires_at', '<=', now())->delete();
        DB::table('api_tokens')->insert(['user_id' => $user->id, 'token_hash' => hash('sha256', $token), 'expires_at' => now()->addHours(12)]);
        $request->setUserResolver(fn () => $user);
        $this->audit($request, 'Signed in', 'Signed in to the workspace.', $user->email);

        return response()->json(['user' => $this->account($user), 'token' => $token]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->account($request->user())]);
    }

    public function logout(Request $request): JsonResponse
    {
        DB::table('api_tokens')->where('id', $request->attributes->get('token_id'))->delete();

        return response()->json(['message' => 'Signed out.']);
    }
}
