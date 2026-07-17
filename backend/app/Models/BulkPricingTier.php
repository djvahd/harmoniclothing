<?php

namespace App\Models;

use Database\Factories\BulkPricingTierFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/** 4.3_Table_Design.md — bulk_pricing_tiers (BR-012). */
#[Fillable(['min_qty', 'max_qty', 'price_per_unit'])]
class BulkPricingTier extends Model
{
    /** @use HasFactory<BulkPricingTierFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'price_per_unit' => 'decimal:2',
        ];
    }
}
