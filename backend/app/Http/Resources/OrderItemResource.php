<?php

namespace App\Http\Resources;

use App\Models\OrderItem;
use App\Services\FileUploadService;
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
            // Full URLs so admin/production staff can open the print file
            // regardless of active disk (local /storage vs R2).
            'custom_design_url' => $this->custom_design_file_path
                ? app(FileUploadService::class)->url($this->custom_design_file_path)
                : null,
            'design_file_url' => $this->design?->file_path
                ? app(FileUploadService::class)->url($this->design->file_path)
                : null,
            'design_position' => $this->design_position,
            'product_variant' => new ProductVariantResource($this->whenLoaded('productVariant')),
            'design' => $this->design ? new DesignResource($this->design) : null,
            'review' => $this->whenLoaded('review', fn () => $this->review ? new ReviewResource($this->review) : null),
        ];
    }
}
