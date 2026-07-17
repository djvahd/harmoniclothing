<?php

namespace Tests\Unit;

use App\Models\BulkPricingTier;
use App\Services\PricingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** BR-012 — tiered bulk pricing by total quantity. */
class PricingServiceTest extends TestCase
{
    use RefreshDatabase;

    private PricingService $pricing;

    protected function setUp(): void
    {
        parent::setUp();
        $this->pricing = new PricingService;

        BulkPricingTier::factory()->create(['min_qty' => 1, 'max_qty' => 49, 'price_per_unit' => 80000]);
        BulkPricingTier::factory()->create(['min_qty' => 50, 'max_qty' => 99, 'price_per_unit' => 70000]);
        BulkPricingTier::factory()->create(['min_qty' => 100, 'max_qty' => null, 'price_per_unit' => 60000]);
    }

    public function test_picks_the_lowest_tier_for_small_quantities(): void
    {
        $this->assertSame('80000.00', $this->pricing->bulkUnitPriceFor(10));
    }

    public function test_picks_the_correct_tier_at_a_boundary(): void
    {
        $this->assertSame('70000.00', $this->pricing->bulkUnitPriceFor(50));
        $this->assertSame('80000.00', $this->pricing->bulkUnitPriceFor(49));
    }

    public function test_uses_the_uncapped_top_tier_for_very_large_quantities(): void
    {
        $this->assertSame('60000.00', $this->pricing->bulkUnitPriceFor(10000));
    }
}
