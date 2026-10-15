<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ends a session once the account's password has changed (e.g. a password
 * reset), so a stolen or forgotten session cannot outlive it. Laravel's own
 * AuthenticateSession is not used: it calls guard()->viaRemember(), which the
 * Sanctum request guard does not have.
 */
class EnsureSessionIsCurrent
{
    // Own key: the framework already keeps 'password_hash_<guard>' (an HMAC) in the session.
    public const SESSION_KEY = 'password_fingerprint';

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || ! $request->hasSession()) {
            return $next($request);
        }

        $current = hash_hmac('sha256', $user->getAuthPassword(), (string) config('app.key'));
        $stored = $request->session()->get(self::SESSION_KEY);

        if ($stored === null) {
            // Session created before this check existed (or just logged in): remember the hash.
            $request->session()->put(self::SESSION_KEY, $current);

            return $next($request);
        }

        if (! hash_equals($stored, $current)) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json(['message' => __('messages.auth.session_expired')], 401);
        }

        return $next($request);
    }
}
