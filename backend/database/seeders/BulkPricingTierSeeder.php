<?php

namespace Database\Seeders;

use App\Models\BulkPricingTier;
use Illuminate\Database\Seeder;

/** BR-012 — tiered per-unit pricing for Bulk Order, global across all products. */
class BulkPricingTierSeeder extends Seeder
{
    public function run(): void
    {
        $tiers = [
            ['min_qty' => 1, 'max_qty' => 49, 'price_per_unit' => 80000],
            ['min_qty' => 50, 'max_qty' => 99, 'price_per_unit' => 70000],
            ['min_qty' => 100, 'max_qty' => 249, 'price_per_unit' => 60000],
            ['min_qty' => 250, 'max_qty' => null, 'price_per_unit' => 50000],
        ];

        foreach ($tiers as $tier) {
            BulkPricingTier::query()->firstOrCreate(['min_qty' => $tier['min_qty']], $tier);
        }
    }
}
