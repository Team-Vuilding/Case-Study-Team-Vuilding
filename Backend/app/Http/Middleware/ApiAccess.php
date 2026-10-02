<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class ApiAccess
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $token = $request->bearerToken();
        $record = $token ? DB::table('api_tokens')->where('token_hash', hash('sha256', $token))->where('expires_at', '>', now())->first() : null;
        $user = $record ? User::find($record->user_id) : null;
        abort_unless($user && $user->is_active, 401, 'Sign in to continue.');
        abort_if($roles && ! in_array($user->access_level, $roles, true), 403, 'You do not have permission for this action.');
        $request->setUserResolver(fn () => $user);
        $request->attributes->set('token_id', $record->id);

        return $next($request);
    }
}
