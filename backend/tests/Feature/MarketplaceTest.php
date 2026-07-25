<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CreatorProfile;
use App\Models\Design;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
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

        $response = $this->getJson("/api/marketplace/designs?categories[]={$category->slug}");

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    /** Regression: a max-only price filter must not 422 (same bug fixed on /catalog/products). */
    public function test_designs_can_be_filtered_by_price_max_only(): void
    {
        $cheap = Design::factory()->create();
        $cheap->products()->attach(Product::factory()->create(['base_price' => 50_000]));
        $expensive = Design::factory()->create();
        $expensive->products()->attach(Product::factory()->create(['base_price' => 500_000]));

        $response = $this->getJson('/api/marketplace/designs?price_max=100000');

        $response->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $cheap->id);
    }

    public function test_designs_can_be_filtered_by_price_range(): void
    {
        $mid = Design::factory()->create();
        $mid->products()->attach(Product::factory()->create(['base_price' => 150_000]));
        $expensive = Design::factory()->create();
        $expensive->products()->attach(Product::factory()->create(['base_price' => 500_000]));

        $response = $this->getJson('/api/marketplace/designs?price_min=100000&price_max=200000');

        $response->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $mid->id);
    }

    public function test_designs_can_be_sorted_by_terlaris(): void
    {
        $bestSeller = Design::factory()->create();
        OrderItem::factory()->create([
            'design_id' => $bestSeller->id,
            'quantity' => 10,
            'order_id' => Order::factory()->create(['status' => 'selesai']),
        ]);

        $cancelledDesign = Design::factory()->create();
        OrderItem::factory()->create([
            'design_id' => $cancelledDesign->id,
            'quantity' => 99,
            'order_id' => Order::factory()->create(['status' => 'dibatalkan']),
        ]);

        Design::factory()->create(); // unsold

        $response = $this->getJson('/api/marketplace/designs?sort=terlaris')->assertOk();

        $response->assertJsonPath('data.0.id', $bestSeller->id);
    }

    public function test_designs_can_be_sorted_by_rating(): void
    {
        $highRated = Design::factory()->create();
        $highItem = OrderItem::factory()->create(['design_id' => $highRated->id]);
        Review::factory()->for($highItem, 'orderItem')->create(['rating' => 5]);

        $lowRated = Design::factory()->create();
        $lowItem = OrderItem::factory()->create(['design_id' => $lowRated->id]);
        Review::factory()->for($lowItem, 'orderItem')->create(['rating' => 2]);

        $response = $this->getJson('/api/marketplace/designs?sort=rating')->assertOk();

        $response->assertJsonPath('data.0.id', $highRated->id);
    }

    public function test_design_list_includes_sold_count_and_rating(): void
    {
        $design = Design::factory()->create();
        $item = OrderItem::factory()->create([
            'design_id' => $design->id,
            'quantity' => 3,
            'order_id' => Order::factory()->create(['status' => 'selesai']),
        ]);
        Review::factory()->for($item, 'orderItem')->create(['rating' => 4]);

        $response = $this->getJson('/api/marketplace/designs')->assertOk();

        $response->assertJsonPath('data.0.sold_count', 3)
            ->assertJsonPath('data.0.rating_average', 4)
            ->assertJsonPath('data.0.review_count', 1);
    }

    public function test_design_with_no_sales_shows_zero_sold_and_null_rating(): void
    {
        Design::factory()->create();

        $response = $this->getJson('/api/marketplace/designs')->assertOk();

        $response->assertJsonPath('data.0.sold_count', 0)
            ->assertJsonPath('data.0.rating_average', null)
            ->assertJsonPath('data.0.review_count', 0);
    }

    public function test_design_filters_endpoint_returns_categories_and_price_range(): void
    {
        $category = Category::factory()->design()->create();
        $design = Design::factory()->for($category)->create();
        $design->products()->attach(Product::factory()->create(['base_price' => 200_000]));

        $response = $this->getJson('/api/marketplace/designs/filters')->assertOk();

        $response->assertJsonPath('data.categories.0.slug', $category->slug)
            ->assertJsonPath('data.price_min', 200000)
            ->assertJsonPath('data.price_max', 200000);
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

    /** FE-017: 3D Editor Mode Marketplace restricts variant choice to the apparel the Creator picked. */
    public function test_design_detail_lists_compatible_products(): void
    {
        $design = Design::factory()->create();
        $product = Product::factory()->create();
        $design->products()->attach($product, ['preview_confirmed_at' => now()]);

        $response = $this->getJson("/api/marketplace/designs/{$design->slug}");

        $response->assertOk()
            ->assertJsonCount(1, 'data.products')
            ->assertJsonPath('data.products.0.slug', $product->slug);
    }

    public function test_guest_can_list_active_creators_only(): void
    {
        CreatorProfile::factory()->aktif()->create();
        CreatorProfile::factory()->menungguApproval()->create();
        CreatorProfile::factory()->banned()->create();

        $response = $this->getJson('/api/marketplace/creators');

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_creators_can_be_searched_by_brand_name(): void
    {
        CreatorProfile::factory()->aktif()->create(['brand_name' => 'Kucing Studio']);
        CreatorProfile::factory()->aktif()->create(['brand_name' => 'Naga Kreatif']);

        $response = $this->getJson('/api/marketplace/creators?search=Kucing');

        $response->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Kucing Studio');
    }

    public function test_creator_list_includes_design_count_sold_count_and_rating(): void
    {
        $profile = CreatorProfile::factory()->aktif()->create();
        $design = Design::factory()->create(['creator_id' => $profile->user_id]);
        $item = OrderItem::factory()->create([
            'design_id' => $design->id,
            'quantity' => 5,
            'order_id' => Order::factory()->create(['status' => 'selesai']),
        ]);
        Review::factory()->for($item, 'orderItem')->create(['rating' => 5]);

        $response = $this->getJson('/api/marketplace/creators')->assertOk();

        $response->assertJsonPath('data.0.design_count', 1)
            ->assertJsonPath('data.0.sold_count', 5)
            ->assertJsonPath('data.0.rating_average', 5)
            ->assertJsonPath('data.0.review_count', 1);
    }

    public function test_creators_can_be_sorted_by_terlaris(): void
    {
        $bestSeller = CreatorProfile::factory()->aktif()->create();
        $bestSellerDesign = Design::factory()->create(['creator_id' => $bestSeller->user_id]);
        OrderItem::factory()->create([
            'design_id' => $bestSellerDesign->id,
            'quantity' => 20,
            'order_id' => Order::factory()->create(['status' => 'selesai']),
        ]);

        CreatorProfile::factory()->aktif()->create(); // no sales

        $response = $this->getJson('/api/marketplace/creators?sort=terlaris')->assertOk();

        $response->assertJsonPath('data.0.slug', $bestSeller->slug);
    }

    public function test_creators_can_be_sorted_by_rating(): void
    {
        $highRated = CreatorProfile::factory()->aktif()->create();
        $highDesign = Design::factory()->create(['creator_id' => $highRated->user_id]);
        Review::factory()->for(OrderItem::factory()->create(['design_id' => $highDesign->id]), 'orderItem')
            ->create(['rating' => 5]);

        $lowRated = CreatorProfile::factory()->aktif()->create();
        $lowDesign = Design::factory()->create(['creator_id' => $lowRated->user_id]);
        Review::factory()->for(OrderItem::factory()->create(['design_id' => $lowDesign->id]), 'orderItem')
            ->create(['rating' => 2]);

        $response = $this->getJson('/api/marketplace/creators?sort=rating')->assertOk();

        $response->assertJsonPath('data.0.slug', $highRated->slug);
    }
}
