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
        if (is_string($request->input('email'))) {
            $request->merge(['email' => strtolower(trim($request->input('email')))]);
        }
        $data = $request->validate([
            'name' => 'required|string|max:200',
            'email' => ['required', 'email', 'max:200', Rule::unique('users')->ignore($user?->id)],
            'accessLevel' => ['required', Rule::in(array_keys(self::ROLES))],
            'password' => ($user ? 'nullable' : 'required').'|string|min:12|max:128',
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'deactivated'])],
        ]);

        $requestedStatus = $data['status'] ?? ($user ? ($user->is_active ? 'active' : 'deactivated') : 'active');
        abort_if($user?->id === $request->user()->id && ($data['accessLevel'] !== 'admin' || $requestedStatus !== 'active'), 422, 'You cannot demote or deactivate yourself.');

        $saved = DB::transaction(function () use ($request, $user, $data, $requestedStatus) {
            $saved = $user ?? new User;
            [$role, $department] = self::ROLES[$data['accessLevel']];

            $isActive = $requestedStatus === 'active';
            $accountStatus = $isActive ? 'active' : 'deactivated';

            $saved->fill([
                'name' => trim($data['name']),
                'email' => strtolower(trim($data['email'])),
                'access_level' => $data['accessLevel'],
                'role' => $role,
                'department' => $department,
                'initials' => collect(explode(' ', trim($data['name'])))->filter()->take(2)->map(fn ($part) => mb_strtoupper(mb_substr($part, 0, 1)))->implode(''),
                'is_active' => $isActive,
                'account_status' => $accountStatus,
            ]);

            if ($isActive) {
                $saved->deactivated_at = null;
                $saved->deletion_at = null;
            } else {
                if (! $saved->deactivated_at) {
                    $saved->deactivated_at = now();
                    $saved->deletion_at = now()->addDays(30);
                }
            }

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
        abort_if($user->id === $request->user()->id, 422, 'You cannot deactivate your own account here.');

        DB::transaction(function () use ($request, $user) {
            $user->deactivate(30);
            DB::table('api_tokens')->where('user_id', $user->id)->delete();
            $this->audit($request, 'Deactivated account', $user->name.' deactivated by admin with 30-day recovery deadline.', $user->email);
        });

        return response()->json([
            'message' => 'Account deactivated. The user has 30 days to recover their account before permanent deletion.',
            'data' => $this->account($user->fresh()),
        ]);
    }

    public function reactivateUser(Request $request, User $user): JsonResponse
    {
        abort_if($user->isExpired(), 422, 'This account has exceeded its 30-day recovery deadline and cannot be reactivated.');

        DB::transaction(function () use ($request, $user) {
            $user->reactivate();
            $this->audit($request, 'Reactivated account', $user->name.' reactivated by administrator.', $user->email);
        });

        return response()->json([
            'message' => 'Account successfully reactivated.',
            'data' => $this->account($user->fresh()),
        ]);
    }
}
