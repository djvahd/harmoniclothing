<?php

namespace App\Http\Resources;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Category */
class CategoryResource extends JsonResource
{
    use ResolvesLocale;

    public function toArray(Request $request): array
    {
        $lang = $this->locale($request);

        return [
            'id' => $this->id,
            'name' => $this->{"name_{$lang}"},
            'slug' => $this->slug,
        ];
    }
}
