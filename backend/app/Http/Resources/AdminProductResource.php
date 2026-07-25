<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Product
 *
 * Admin-only CMS view of a product — unlike the public ProductResource
 * (which resolves a single locale via Accept-Language), this exposes both
 * name_id/name_en and description_id/description_en so Admin can edit
 * either language, plus is_active.
 */
class AdminProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'gender_segment' => $this->gender_segment,
            'name_id' => $this->name_id,
            'name_en' => $this->name_en,
            'description_id' => $this->description_id,
            'description_en' => $this->description_en,
            'slug' => $this->slug,
            'base_price' => $this->base_price,
            'is_active' => $this->is_active,
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
        ];
    }
}
