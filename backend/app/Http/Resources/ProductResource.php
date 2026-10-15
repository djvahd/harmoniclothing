<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Product */
class ProductResource extends JsonResource
{
    use ResolvesLocale;

    public function toArray(Request $request): array
    {
        $lang = $this->locale($request);

        return [
            'id' => $this->id,
            // An untranslated (blank) EN field falls back to Indonesian instead of rendering empty.
            'name' => $this->{"name_{$lang}"} ?: $this->name_id,
            'description' => $this->{"description_{$lang}"} ?: $this->description_id,
            'slug' => $this->slug,
            'base_price' => $this->base_price,
            'gender_segment' => $this->gender_segment,
            'sold_count' => (int) ($this->sold_count ?? 0),
            'rating_average' => $this->avg_rating !== null ? round((float) $this->avg_rating, 1) : null,
            'review_count' => (int) ($this->review_count ?? 0),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
        ];
    }
}
