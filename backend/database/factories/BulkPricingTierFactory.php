<?php

namespace Database\Factories;

use App\Models\BulkPricingTier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BulkPricingTier>
 */
class BulkPricingTierFactory extends Factory
{
    public function definition(): array
    {
        return [
            'min_qty' => 1,
            'max_qty' => 49,
            'price_per_unit' => 80000,
        ];
    }
}
