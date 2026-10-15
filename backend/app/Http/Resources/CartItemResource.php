<?php

namespace App\Http\Resources;

use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CartItem */
class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quantity' => $this->quantity,
            'notes' => $this->notes,
            'unit_price_snapshot' => $this->unit_price_snapshot,
            'subtotal' => $this->subtotal(),
            'design_position' => $this->design_position,
            'custom_design_file_path' => $this->custom_design_file_path,
            'is_available' => $this->isAvailable(), // BR-024
            'product_variant' => new ProductVariantResource($this->whenLoaded('productVariant')),
            'design' => $this->design ? new DesignResource($this->design) : null,
        ];
    }
}
