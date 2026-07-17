<?php

namespace App\Http\Resources;

use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin OrderItem */
class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'subtotal' => $this->subtotal,
            'custom_design_file_path' => $this->custom_design_file_path,
            'design_position' => $this->design_position,
            'product_variant' => new ProductVariantResource($this->whenLoaded('productVariant')),
            'design' => $this->design ? new DesignResource($this->design) : null,
        ];
    }
}
