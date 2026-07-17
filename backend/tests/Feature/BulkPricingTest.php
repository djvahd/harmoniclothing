<?php

namespace Tests\Feature;

use App\Models\BulkPricingTier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** 5.2_API_List.md §4 — GET /bulk-pricing-tiers, public (BR-012). */
class BulkPricingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_tiers_ordered_by_min_qty(): void
    {
        BulkPricingTier::factory()->create(['min_qty' => 100, 'max_qty' => null, 'price_per_unit' => 50000]);
        BulkPricingTier::factory()->create(['min_qty' => 1, 'max_qty' => 99, 'price_per_unit' => 80000]);

        $response = $this->getJson('/api/bulk-pricing-tiers');

        $response->assertOk()
            ->assertJsonPath('data.0.min_qty', 1)
            ->assertJsonPath('data.1.min_qty', 100);
    }
}
