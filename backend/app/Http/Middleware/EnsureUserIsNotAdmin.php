<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * 2.5_Permission_Matrix.md: Admin is operational only and never acts as a
 * Customer (no cart, wishlist or checkout).
 */
class EnsureUserIsNotAdmin
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_if($request->user()?->role === UserRole::Admin, 403);

        return $next($request);
    }
}
