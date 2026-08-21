<?php

namespace App\Http\Resources;

use App\Models\ProductVariant;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ProductVariant
 *
 * The 'product' key is only present when the `product` relation is eager-
 * loaded (cart/order contexts, where the frontend needs the product name
 * to show what's actually in the cart/order - discovered missing via live
 * browser testing 2026-07-20, product names were silently blank on Cart/
 * Checkout/Riwayat Pesanan). Deliberately omitted from the public Katalog
 * listing (ProductResource already has the name at the top level there;
 * re-embedding it per-variant would be redundant payload).
 */
class ProductVariantResource extends JsonResource
{
    use ResolvesLocale;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'color' => $this->color,
            'size' => $this->size,
            'cut_type' => $this->cut_type,
            'print_areas' => $this->print_areas,
            'material' => $this->material,
            'price_modifier' => $this->price_modifier,
            // Resolved to a full URL (not the raw stored path) so the
            // frontend works regardless of which disk is active (local
            // /storage vs R2's own domain) — see filesystems.php public_disk.
            'mockup_asset_path' => $this->mockup_asset_path
                ? app(FileUploadService::class)->url($this->mockup_asset_path)
                : null,
            'product' => $this->whenLoaded('product', fn () => [
                'name' => $this->product->{'name_'.$this->locale($request)},
                'slug' => $this->product->slug,
            ]),
        ];
    }
}
