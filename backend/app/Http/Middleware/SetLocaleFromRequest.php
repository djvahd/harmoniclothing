<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * 6b.5: sets app()->getLocale() from ?lang= or Accept-Language so __()
 * (validation/exception messages) matches the same locale ResolvesLocale
 * already uses to pick bilingual DB columns (name_id/name_en etc.) — same
 * detection rule, single source of truth for "id" vs "en".
 */
class SetLocaleFromRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        $lang = $request->query('lang') ?? $request->header('Accept-Language');

        app()->setLocale(str_starts_with((string) $lang, 'en') ? 'en' : 'id');

        return $next($request);
    }
}
