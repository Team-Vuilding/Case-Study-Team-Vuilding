<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Response;

class ApiCookieSession
{
    public const COOKIE_NAME = 'wba_session';

    public static function sessionCookie(Request $request, string $token = ''): Cookie
    {
        return Cookie::create(self::COOKIE_NAME, $token, $token === '' ? 1 : 0, '/api', null,
            $request->isSecure() || app()->isProduction(), true, false, Cookie::SAMESITE_LAX);
    }

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $usesCookie = $request->boolean('useSessionCookie') || (! $request->bearerToken() && $request->cookie(self::COOKIE_NAME));
        if ($usesCookie && ! $request->isMethodSafe()) {
            $origins = array_map(fn (string $origin) => rtrim(trim($origin), '/'), config('cors.allowed_origins', []));
            abort_unless($request->isJson() && in_array($request->header('Origin'), $origins, true), 403, 'Request origin is not allowed.');
        }
        $response = $next($request);
        $response->headers->set('Cache-Control', 'private, no-store');

        return $response;
    }
}
