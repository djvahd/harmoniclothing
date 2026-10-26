<?php

namespace App\Http\Middleware;

use App\Enums\UserStatus;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * A banned user (e.g. a creator banned for a copyright violation, BR-019/020)
 * must lose access immediately, not only at the next login: an already
 * established Sanctum session is ended and the request is rejected.
 */
class EnsureUserIsActive
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $status = $request->user()?->status;
        if ($status === UserStatus::Banned || $status === UserStatus::Nonaktif) {
            Auth::guard('web')->logout();

            // A token-authenticated or non-stateful request has no session to end.
            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            return response()->json(['message' => $status === UserStatus::Banned ? __('messages.auth.account_banned') : __('messages.auth.account_inactive')], 403);
        }

        return $next($request);
    }
}
