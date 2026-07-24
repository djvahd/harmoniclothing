<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** 5.2_API_List.md §3 — GET /catalog/products (FE-012/013). */
class CatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_active_products(): void
    {
        Product::factory()->count(2)->create();
        Product::factory()->inactive()->create();

        $response = $this->getJson('/api/catalog/products');

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_products_can_be_filtered_by_category(): void
    {
        $category = Category::factory()->product()->create();
        Product::factory()->for($category)->create();
        Product::factory()->create(); // different category

        $response = $this->getJson("/api/catalog/products?categories[]={$category->slug}");

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_category_filter_is_multiselect(): void
    {
        $categoryA = Category::factory()->product()->create();
        $categoryB = Category::factory()->product()->create();
        $categoryC = Category::factory()->product()->create();
        Product::factory()->for($categoryA)->create();
        Product::factory()->for($categoryB)->create();
        Product::factory()->for($categoryC)->create();

        $response = $this->getJson("/api/catalog/products?categories[]={$categoryA->slug}&categories[]={$categoryB->slug}");

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_products_can_be_filtered_by_gender_segment(): void
    {
        Product::factory()->create(['gender_segment' => 'pria']);
        Product::factory()->create(['gender_segment' => 'wanita']);
        Product::factory()->create(['gender_segment' => 'anak']);

        $response = $this->getJson('/api/catalog/products?genders[]=pria&genders[]=wanita');

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_products_can_be_filtered_by_print_area(): void
    {
        $withBack = Product::factory()->create();
        ProductVariant::factory()->for($withBack)->create(['print_areas' => ['depan', 'belakang']]);

        $frontOnly = Product::factory()->create();
        ProductVariant::factory()->for($frontOnly)->create(['print_areas' => ['depan']]);

        $response = $this->getJson('/api/catalog/products?print_areas[]=belakang');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $withBack->id);
    }

    public function test_guest_can_view_product_detail_with_variants(): void
    {
        $product = Product::factory()->create();
        ProductVariant::factory()->count(2)->for($product)->create();

        $response = $this->getJson("/api/catalog/products/{$product->slug}");

        $response->assertOk()->assertJsonCount(2, 'data.variants');
    }

    public function test_inactive_product_detail_is_not_found(): void
    {
        $product = Product::factory()->inactive()->create();

        $this->getJson("/api/catalog/products/{$product->slug}")->assertNotFound();
    }

    public function test_product_name_follows_lang_query_param(): void
    {
        $product = Product::factory()->create(['name_id' => 'Kaos Polos', 'name_en' => 'Plain T-Shirt']);

        $this->getJson("/api/catalog/products/{$product->slug}?lang=en")
            ->assertJsonPath('data.name', 'Plain T-Shirt');

        $this->getJson("/api/catalog/products/{$product->slug}?lang=id")
            ->assertJsonPath('data.name', 'Kaos Polos');
    }

    public function test_products_can_be_filtered_by_price_range(): void
    {
        Product::factory()->create(['base_price' => 50000]);
        Product::factory()->create(['base_price' => 150000]);
        Product::factory()->create(['base_price' => 300000]);

        $response = $this->getJson('/api/catalog/products?price_min=100000&price_max=200000');

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_products_can_be_filtered_by_size_and_color(): void
    {
        $matching = Product::factory()->create();
        ProductVariant::factory()->for($matching)->create(['size' => 'XL', 'color' => 'Navy']);

        $other = Product::factory()->create();
        ProductVariant::factory()->for($other)->create(['size' => 'S', 'color' => 'Hitam']);

        $this->getJson('/api/catalog/products?sizes[]=XL')
            ->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matching->id);

        $this->getJson('/api/catalog/products?colors[]=Navy')
            ->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matching->id);
    }

    public function test_products_can_be_filtered_by_material(): void
    {
        $matching = Product::factory()->create();
        ProductVariant::factory()->for($matching)->create(['material' => 'Fleece']);

        $other = Product::factory()->create();
        ProductVariant::factory()->for($other)->create(['material' => 'Cotton Combed 24s']);

        $response = $this->getJson('/api/catalog/products?materials[]=Fleece');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $matching->id);
    }

    public function test_size_filter_is_multiselect(): void
    {
        $small = Product::factory()->create();
        ProductVariant::factory()->for($small)->create(['size' => 'S']);

        $large = Product::factory()->create();
        ProductVariant::factory()->for($large)->create(['size' => 'L']);

        $extraLarge = Product::factory()->create();
        ProductVariant::factory()->for($extraLarge)->create(['size' => 'XL']);

        $response = $this->getJson('/api/catalog/products?sizes[]=S&sizes[]=L');

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_products_can_be_sorted_by_price(): void
    {
        $cheap = Product::factory()->create(['base_price' => 50000]);
        $expensive = Product::factory()->create(['base_price' => 200000]);

        $this->getJson('/api/catalog/products?sort=harga_asc')
            ->assertOk()->assertJsonPath('data.0.id', $cheap->id);

        $this->getJson('/api/catalog/products?sort=harga_desc')
            ->assertOk()->assertJsonPath('data.0.id', $expensive->id);
    }

    public function test_products_can_be_sorted_by_terlaris(): void
    {
        $bestSeller = Product::factory()->create();
        $bestSellerVariant = ProductVariant::factory()->for($bestSeller)->create();
        OrderItem::factory()->for($bestSellerVariant, 'productVariant')
            ->for(Order::factory()->create(['status' => 'selesai']))
            ->create(['quantity' => 10]);

        $cancelledOrderProduct = Product::factory()->create();
        $cancelledVariant = ProductVariant::factory()->for($cancelledOrderProduct)->create();
        OrderItem::factory()->for($cancelledVariant, 'productVariant')
            ->for(Order::factory()->create(['status' => 'dibatalkan']))
            ->create(['quantity' => 99]);

        $unsold = Product::factory()->create();
        ProductVariant::factory()->for($unsold)->create();

        $response = $this->getJson('/api/catalog/products?sort=terlaris')->assertOk();

        $response->assertJsonPath('data.0.id', $bestSeller->id);
    }

    public function test_products_can_be_sorted_by_rating(): void
    {
        $highRated = Product::factory()->create();
        $highVariant = ProductVariant::factory()->for($highRated)->create();
        $highItem = OrderItem::factory()->for($highVariant, 'productVariant')->create();
        Review::factory()->for($highItem, 'orderItem')->create(['rating' => 5]);

        $lowRated = Product::factory()->create();
        $lowVariant = ProductVariant::factory()->for($lowRated)->create();
        $lowItem = OrderItem::factory()->for($lowVariant, 'productVariant')->create();
        Review::factory()->for($lowItem, 'orderItem')->create(['rating' => 2]);

        $response = $this->getJson('/api/catalog/products?sort=rating')->assertOk();

        $response->assertJsonPath('data.0.id', $highRated->id);
    }

    public function test_product_list_always_includes_sold_count_and_rating_regardless_of_sort(): void
    {
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->for($product)->create();
        $item = OrderItem::factory()->for($variant, 'productVariant')
            ->for(Order::factory()->create(['status' => 'selesai']))
            ->create(['quantity' => 3]);
        Review::factory()->for($item, 'orderItem')->create(['rating' => 4]);

        $response = $this->getJson('/api/catalog/products?sort=terbaru')->assertOk();

        $response->assertJsonPath('data.0.sold_count', 3)
            ->assertJsonPath('data.0.rating_average', 4)
            ->assertJsonPath('data.0.review_count', 1);
    }

    public function test_product_with_no_sales_shows_zero_sold_and_null_rating(): void
    {
        Product::factory()->create();

        $response = $this->getJson('/api/catalog/products')->assertOk();

        $response->assertJsonPath('data.0.sold_count', 0)
            ->assertJsonPath('data.0.rating_average', null)
            ->assertJsonPath('data.0.review_count', 0);
    }

    public function test_compare_price_yields_discount_percent(): void
    {
        $discounted = Product::factory()->create(['base_price' => 80000, 'compare_price' => 100000]);
        $fullPrice = Product::factory()->create(['base_price' => 50000, 'compare_price' => null]);

        $this->getJson("/api/catalog/products/{$discounted->slug}")
            ->assertJsonPath('data.compare_price', '100000.00')
            ->assertJsonPath('data.discount_percent', 20);

        $this->getJson("/api/catalog/products/{$fullPrice->slug}")
            ->assertJsonPath('data.compare_price', null)
            ->assertJsonPath('data.discount_percent', null);
    }

    public function test_filter_facets_return_distinct_sizes_colors_and_price_range(): void
    {
        $category = Category::factory()->product()->create(['name_id' => 'Kaos', 'name_en' => 'T-Shirt']);
        $product = Product::factory()->for($category)->create(['base_price' => 100000, 'gender_segment' => 'pria']);
        ProductVariant::factory()->for($product)->create(['size' => 'M', 'color' => 'Hitam', 'material' => 'Fleece', 'print_areas' => ['depan']]);
        ProductVariant::factory()->for($product)->create(['size' => 'L', 'color' => 'Hitam', 'material' => 'Fleece', 'print_areas' => ['belakang']]);

        $other = Product::factory()->create(['base_price' => 250000, 'gender_segment' => 'wanita']);
        ProductVariant::factory()->for($other)->create(['size' => 'M', 'color' => 'Putih', 'material' => 'Cotton Combed 24s', 'print_areas' => ['lengan']]);

        $response = $this->getJson('/api/catalog/products/filters?lang=id')->assertOk();

        $response->assertJsonPath('data.price_min', 100000)
            ->assertJsonPath('data.price_max', 250000);
        $this->assertEqualsCanonicalizing(['L', 'M'], $response->json('data.sizes'));
        $this->assertEqualsCanonicalizing(['Hitam', 'Putih'], $response->json('data.colors'));
        $this->assertEqualsCanonicalizing(['Cotton Combed 24s', 'Fleece'], $response->json('data.materials'));
        $this->assertEqualsCanonicalizing(['pria', 'wanita'], $response->json('data.genders'));
        $this->assertEqualsCanonicalizing(['belakang', 'depan', 'lengan'], $response->json('data.print_areas'));
        $categories = collect($response->json('data.categories'));
        $this->assertTrue($categories->contains(fn ($c) => $c['slug'] === $category->slug && $c['name'] === 'Kaos'));
    }
}
