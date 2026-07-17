<?php

namespace App\Http\Resources;

use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ProductVariant */
class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'color' => $this->color,
            'size' => $this->size,
            'cut_type' => $this->cut_type,
            'material' => $this->material,
            'price_modifier' => $this->price_modifier,
            'mockup_asset_path' => $this->mockup_asset_path,
        ];
    }
}
