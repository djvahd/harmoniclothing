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
            'name' => $this->{"name_{$lang}"},
            'description' => $this->{"description_{$lang}"},
            'slug' => $this->slug,
            'base_price' => $this->base_price,
            'gender_segment' => $this->gender_segment,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
        ];
    }
}
