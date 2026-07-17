<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
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

        $response = $this->getJson("/api/catalog/products?category={$category->slug}");

        $response->assertOk()->assertJsonCount(1, 'data');
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
}
