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

        $comparePrice = $this->compare_price !== null ? (float) $this->compare_price : null;
        $discountPercent = $comparePrice && $comparePrice > $this->base_price
            ? (int) round((($comparePrice - $this->base_price) / $comparePrice) * 100)
            : null;

        return [
            'id' => $this->id,
            'name' => $this->{"name_{$lang}"},
            'description' => $this->{"description_{$lang}"},
            'slug' => $this->slug,
            'base_price' => $this->base_price,
            'compare_price' => $this->compare_price,
            'discount_percent' => $discountPercent,
            'gender_segment' => $this->gender_segment,
            'sold_count' => (int) ($this->sold_count ?? 0),
            'rating_average' => $this->avg_rating !== null ? round((float) $this->avg_rating, 1) : null,
            'review_count' => (int) ($this->review_count ?? 0),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
        ];
    }
}
