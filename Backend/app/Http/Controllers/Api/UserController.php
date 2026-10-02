<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UserController extends ApiController
{
    public function users(Request $request): JsonResponse
    {
        return response()->json(['data' => User::orderBy('name')->get()->map(fn ($user) => $this->account($user))]);
    }

    public function saveUser(Request $request, ?User $user = null): JsonResponse
    {
        $data = $request->validate(['name' => 'required|string|max:200', 'email' => ['required', 'email', 'max:200', Rule::unique('users')->ignore($user?->id)],
            'accessLevel' => ['required', Rule::in(array_keys(self::ROLES))], 'password' => ($user ? 'nullable' : 'required').'|string|min:12|max:128',
            'status' => ['sometimes', Rule::in(['active', 'inactive'])]]);
        abort_if($user?->id === $request->user()->id && ($data['accessLevel'] !== 'admin' || ($data['status'] ?? 'active') !== 'active'), 422, 'You cannot demote or deactivate yourself.');
        $saved = DB::transaction(function () use ($request, $user, $data) {
            $saved = $user ?? new User;
            [$role, $department] = self::ROLES[$data['accessLevel']];
            $saved->fill(['name' => trim($data['name']), 'email' => strtolower(trim($data['email'])), 'access_level' => $data['accessLevel'],
                'role' => $role, 'department' => $department, 'initials' => collect(explode(' ', trim($data['name'])))->filter()->take(2)->map(fn ($part) => mb_strtoupper(mb_substr($part, 0, 1)))->implode(''),
                'is_active' => ($data['status'] ?? ($user?->is_active === false ? 'inactive' : 'active')) === 'active']);
            if (! empty($data['password'])) {
                $saved->password = $data['password'];
            }
            $saved->save();
            if ($user && (! empty($data['password']) || ! $saved->is_active || $saved->wasChanged('access_level'))) {
                DB::table('api_tokens')->where('user_id', $saved->id)->delete();
            }
            $this->audit($request, $user ? 'Updated account' : 'Created account', $saved->name.' account saved.', $saved->email);

            return $saved;
        });

        return response()->json(['data' => $this->account($saved)], $user ? 200 : 201);
    }

    public function deactivateUser(Request $request, User $user): JsonResponse
    {
        abort_if($user->id === $request->user()->id, 422, 'You cannot deactivate yourself.');
        DB::transaction(function () use ($request, $user) {
            $user->update(['is_active' => false]);
            DB::table('api_tokens')->where('user_id', $user->id)->delete();
            $this->audit($request, 'Deactivated account', $user->name.' deactivated.', $user->email);
        });

        return response()->json(['message' => 'Account deactivated.']);
    }
}
