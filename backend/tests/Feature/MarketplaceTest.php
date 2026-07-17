<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Design;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** 5.2_API_List.md §3 — GET /marketplace/designs (FE-008/009/010). */
class MarketplaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_active_designs_only(): void
    {
        Design::factory()->count(2)->create();
        Design::factory()->pendingApproval()->create();
        Design::factory()->rejected()->create();

        $response = $this->getJson('/api/marketplace/designs');

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_designs_can_be_searched_by_title(): void
    {
        Design::factory()->create(['title' => 'Kucing Lucu']);
        Design::factory()->create(['title' => 'Naga Api']);

        $response = $this->getJson('/api/marketplace/designs?search=Kucing');

        $response->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Kucing Lucu');
    }

    public function test_designs_can_be_filtered_by_category(): void
    {
        $category = Category::factory()->design()->create();
        Design::factory()->for($category)->create();
        Design::factory()->create(); // different category

        $response = $this->getJson("/api/marketplace/designs?category={$category->slug}");

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_guest_can_view_design_detail(): void
    {
        $design = Design::factory()->create();

        $response = $this->getJson("/api/marketplace/designs/{$design->slug}");

        $response->assertOk()->assertJsonPath('data.title', $design->title);
    }

    public function test_pending_or_rejected_design_detail_is_not_found(): void
    {
        $design = Design::factory()->pendingApproval()->create();

        $this->getJson("/api/marketplace/designs/{$design->slug}")->assertNotFound();
    }
}
