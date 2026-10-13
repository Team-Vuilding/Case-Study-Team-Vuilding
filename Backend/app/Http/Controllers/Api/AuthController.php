<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends ApiController
{
    private const MAX_FAILURES = 6;

    private const COOLDOWN_SECONDS = 180;

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => 'required|email|max:254', 'password' => 'required|string|max:128', 'accessLevel' => ['required', Rule::in(array_keys(self::ROLES))]]);
        $attemptKey = $this->authAttemptKey($request, $data['email']);
        $retryAfter = RateLimiter::availableIn($attemptKey.':cooldown');
        if ($retryAfter > 0) {
            return $this->cooldownResponse($retryAfter);
        }
        $user = User::where('email', strtolower(trim($data['email'])))->first();
        if (! $user || ! Hash::check($data['password'], $user->password) || $user->access_level !== $data['accessLevel']) {
            return $this->failedCredentials($attemptKey, 'The credentials do not match an account for this role.');
        }
        RateLimiter::clear($attemptKey.':failures');

        // Handle deactivated account state
        if ($user->isDeactivated()) {
            if ($user->isExpired()) {
                return response()->json([
                    'message' => 'The 30-day recovery deadline has expired. This account is scheduled for permanent deletion.',
                    'accountStatus' => 'expired',
                    'canReactivate' => false,
                ], 422);
            }

            $remainingDays = $user->remainingDays() ?? 30;

            return response()->json([
                'message' => sprintf(
                    'This account is deactivated. You have until %s (%d day%s remaining) to reactivate it.',
                    $user->deletion_at?->format('M d, Y g:i A') ?? 'the scheduled deadline',
                    $remainingDays,
                    $remainingDays === 1 ? '' : 's'
                ),
                'accountStatus' => 'deactivated',
                'deactivatedAt' => $user->deactivated_at?->toISOString(),
                'deletionAt' => $user->deletion_at?->toISOString(),
                'remainingSeconds' => $user->remainingSeconds(),
                'remainingDays' => $remainingDays,
                'canReactivate' => true,
                'email' => $user->email,
                'accessLevel' => $user->access_level,
            ], 422);
        }

        $token = Str::random(64);
        DB::table('api_tokens')->where('expires_at', '<=', now())->delete();
        DB::table('api_tokens')->insert(['user_id' => $user->id, 'token_hash' => hash('sha256', $token), 'expires_at' => now()->addHours(12)]);
        $request->setUserResolver(fn () => $user);
        $this->audit($request, 'Signed in', 'Signed in to the workspace.', $user->email);

        return response()->json(['user' => $this->account($user), 'token' => $token]);
    }

    public function reactivate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email|max:254',
            'password' => 'required|string|max:128',
            'accessLevel' => ['required', Rule::in(array_keys(self::ROLES))],
        ]);

        $attemptKey = $this->authAttemptKey($request, $data['email']);
        $retryAfter = RateLimiter::availableIn($attemptKey.':cooldown');
        if ($retryAfter > 0) {
            return $this->cooldownResponse($retryAfter);
        }
        $user = User::where('email', strtolower(trim($data['email'])))->first();

        if (! $user || ! Hash::check($data['password'], $user->password) || $user->access_level !== $data['accessLevel']) {
            return $this->failedCredentials($attemptKey, 'Invalid recovery credentials provided.');
        }
        RateLimiter::clear($attemptKey.':failures');

        if (! $user->isDeactivated()) {
            return response()->json(['message' => 'This account is already active.'], 422);
        }

        if ($user->isExpired()) {
            return response()->json([
                'message' => 'The 30-day recovery deadline has expired. This account can no longer be reactivated.',
                'accountStatus' => 'expired',
                'canReactivate' => false,
            ], 403);
        }

        // Reactivate account and reset deadlines
        $user->reactivate();

        $token = Str::random(64);
        DB::table('api_tokens')->where('expires_at', '<=', now())->delete();
        DB::table('api_tokens')->insert(['user_id' => $user->id, 'token_hash' => hash('sha256', $token), 'expires_at' => now()->addHours(12)]);
        $request->setUserResolver(fn () => $user);
        $this->audit($request, 'Reactivated account', 'Account reactivated by user within 30-day recovery window.', $user->email);

        return response()->json([
            'message' => 'Account successfully reactivated. Welcome back!',
            'user' => $this->account($user->fresh()),
            'token' => $token,
        ]);
    }

    public function deactivate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 422);
        }

        // Guard against deactivating the last active administrator
        if ($user->access_level === 'admin' && User::where('access_level', 'admin')->where('is_active', true)->count() <= 1) {
            return response()->json(['message' => 'You cannot deactivate the only active system administrator account.'], 422);
        }

        $user->deactivate(30);
        DB::table('api_tokens')->where('user_id', $user->id)->delete();
        $this->audit($request, 'Deactivated account', $user->name.' deactivated their own account with a 30-day recovery deadline.', $user->email);

        return response()->json([
            'message' => 'Account deactivated. You have 30 days to reactivate it before permanent deletion.',
            'deactivatedAt' => $user->deactivated_at?->toISOString(),
            'deletionAt' => $user->deletion_at?->toISOString(),
            'remainingDays' => 30,
        ]);
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

    private function authAttemptKey(Request $request, string $email): string
    {
        return 'auth-attempts:'.hash('sha256', strtolower(trim($email)).'|'.$request->ip());
    }

    private function failedCredentials(string $attemptKey, string $message): JsonResponse
    {
        $failures = RateLimiter::hit($attemptKey.':failures', self::COOLDOWN_SECONDS);
        if ($failures >= self::MAX_FAILURES) {
            RateLimiter::hit($attemptKey.':cooldown', self::COOLDOWN_SECONDS);

            return $this->cooldownResponse(RateLimiter::availableIn($attemptKey.':cooldown'));
        }

        return response()->json(['message' => $message], 422);
    }

    private function cooldownResponse(int $seconds): JsonResponse
    {
        return response()->json([
            'message' => 'Too many sign-in attempts. Try again in '.$seconds.' seconds.',
            'retryAfter' => $seconds,
        ], 429)->header('Retry-After', (string) $seconds);
    }
}
