<?php

namespace App\Http\Resources;

use App\Models\Design;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Design */
class DesignResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'thumbnail_path' => $this->thumbnail_path,
            'status' => $this->status,
            'rejection_reason' => $this->rejection_reason,
            'starting_price' => $this->starting_price !== null ? (float) $this->starting_price : null,
            'sold_count' => (int) ($this->sold_count ?? 0),
            'rating_average' => $this->avg_rating !== null ? round((float) $this->avg_rating, 1) : null,
            'review_count' => (int) ($this->review_count ?? 0),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'creator' => [
                'id' => $this->creator->id,
                'name' => $this->creator->creatorProfile?->brand_name ?? $this->creator->name,
                'slug' => $this->creator->creatorProfile?->slug,
            ],
            // FE-017: 3D Editor Mode Marketplace only offers the apparel the
            // Creator picked for this design (design_product pivot).
            'products' => ProductResource::collection($this->whenLoaded('products')),
            // FR-037/Flow 16: Creator's own management view needs the
            // per-apparel confirmation state, not just the product list.
            'apparel' => $this->whenLoaded('products', fn () => $this->products->map(fn ($product) => [
                'product_id' => $product->id,
                'slug' => $product->slug,
                'confirmed_at' => $product->pivot->preview_confirmed_at,
            ])),
        ];
    }
}
