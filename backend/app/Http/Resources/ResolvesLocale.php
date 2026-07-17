<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/**
 * 5.3_API_Specification.md §8 (GET /catalog/products): bilingual columns
 * (`name_id`/`name_en`) are picked by `?lang=` or Accept-Language, not both
 * exposed — NFR-008.
 */
trait ResolvesLocale
{
    private function locale(Request $request): string
    {
        $lang = $request->query('lang') ?? $request->header('Accept-Language');

        return str_starts_with((string) $lang, 'en') ? 'en' : 'id';
    }
}
