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
            'category' => new CategoryResource($this->whenLoaded('category')),
            'creator' => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ],
            // FE-017: 3D Editor Mode Marketplace only offers the apparel the
            // Creator picked for this design (design_product pivot).
            'products' => ProductResource::collection($this->whenLoaded('products')),
        ];
    }
}
