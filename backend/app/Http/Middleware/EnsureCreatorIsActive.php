<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * 2.5_Permission_Matrix.md §7: `/api/creator/*` requires `role:creator
 * (status "Aktif")`. BR-013: Creator is existence-based via
 * creator_profiles.status, not a users.role value.
 */
class EnsureCreatorIsActive
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->creatorProfile?->status === 'aktif', 403);

        return $next($request);
    }
}
