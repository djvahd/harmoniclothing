<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * 2.5_Permission_Matrix.md §7: `/api/admin/*` requires `role:admin`.
 * `users.role='admin'` is provisioned manually (2.2_User_Roles.md §8),
 * never via /auth/register.
 */
class EnsureUserIsAdmin
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->role === UserRole::Admin, 403);

        return $next($request);
    }
}
