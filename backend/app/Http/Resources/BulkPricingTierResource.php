<?php

namespace App\Http\Resources;

use App\Models\BulkPricingTier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin BulkPricingTier */
class BulkPricingTierResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'min_qty' => $this->min_qty,
            'max_qty' => $this->max_qty,
            'price_per_unit' => $this->price_per_unit,
        ];
    }
}
