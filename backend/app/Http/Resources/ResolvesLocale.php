<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/**
 * 5.3_API_Specification.md §8 (GET /catalog/products): bilingual columns
 * (`name_id`/`name_en`) are picked by `?lang=` or Accept-Language, not both
 * exposed — NFR-008.
 *
 * 6b.5: delegates to app()->getLocale() (set once per request by
 * SetLocaleFromRequest middleware from the exact same `?lang=`/
 * Accept-Language rule) rather than re-parsing the request here, so this
 * trait and __() validation/exception messages can never drift out of sync.
 */
trait ResolvesLocale
{
    private function locale(Request $request): string
    {
        return app()->getLocale();
    }
}
