<?php

namespace App\Services;

use App\Models\BulkPricingTier;
use App\Models\ProductVariant;

/**
 * 3.3_Module_Breakdown.md §6 Shared Component — Order Management & Product
 * Customization both price against this. FE-026 regular pricing; FE-052/056
 * bulk tiered pricing (BR-012).
 */
class PricingService
{
    /** Regular item unit price: base product price + variant modifier. */
    public function unitPriceFor(ProductVariant $variant): string
    {
        return bcadd(
            (string) $variant->product->base_price,
            (string) $variant->price_modifier,
            2
        );
    }

    /**
     * BR-012: Bulk Order price-per-unit is tiered by *total* quantity across
     * the whole bulk order, regardless of size mix (FR-044) — not per
     * product/variant. Falls back to the highest tier below the given
     * quantity if no tier's range covers it exactly (shouldn't happen with
     * a correctly configured tier table, but avoids a hard failure).
     */
    public function bulkUnitPriceFor(int $totalQuantity): ?string
    {
        $tier = BulkPricingTier::query()
            ->where('min_qty', '<=', $totalQuantity)
            ->where(fn ($query) => $query->whereNull('max_qty')->orWhere('max_qty', '>=', $totalQuantity))
            ->orderByDesc('min_qty')
            ->first();

        return $tier?->price_per_unit;
    }
}
