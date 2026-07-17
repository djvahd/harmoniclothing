<?php

namespace App\Http\Resources;

use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Wishlist
 *
 * BR-024: not removed automatically when unavailable — "Tidak Tersedia"
 * badge is computed from products.is_active / designs.status at query time.
 */
class WishlistResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product' => $this->product ? new ProductResource($this->product) : null,
            'design' => $this->design ? new DesignResource($this->design) : null,
            'is_available' => $this->product
                ? (bool) $this->product->is_active
                : $this->design?->status === 'aktif',
        ];
    }
}
