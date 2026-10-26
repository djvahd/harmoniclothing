<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Admin Product Catalog management — FR-031, BR-012, FE-046. */
class AdminCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_create_products(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/admin/catalog/products', [])->assertForbidden();
    }

    public function test_admin_can_create_a_product_with_auto_generated_slug(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->product()->create();

        $response = $this->actingAs($admin)->postJson('/api/admin/catalog/products', [
            'category_id' => $category->id,
            'name_id' => 'Kaos Polos Premium',
            'name_en' => 'Premium Plain Shirt',
            'base_price' => 85000,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.slug', 'kaos-polos-premium')
            ->assertJsonPath('data.is_active', true);
    }

    public function test_admin_can_update_a_product(): void
    {
        $admin = User::factory()->admin()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($admin)->patchJson("/api/admin/catalog/products/{$product->id}", [
            'name_id' => $product->name_id,
            'name_en' => $product->name_en,
            'base_price' => 999000,
            'is_active' => false,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.base_price', '999000.00')
            ->assertJsonPath('data.is_active', false);
    }

    public function test_admin_can_add_a_variant_to_a_product(): void
    {
        $admin = User::factory()->admin()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($admin)->postJson("/api/admin/catalog/products/{$product->id}/variants", [
            'color' => 'Hitam',
            'size' => 'L',
            'cut_type' => 'Regular',
            'material' => 'Cotton Combed 30s',
            'mockup_asset_path' => 'mockups/hitam-l-regular.glb',
        ]);

        $response->assertCreated()->assertJsonPath('data.color', 'Hitam');
    }

    public function test_cannot_add_a_duplicate_variant_combination(): void
    {
        $admin = User::factory()->admin()->create();
        $product = Product::factory()->create();
        ProductVariant::factory()->for($product)->create([
            'color' => 'Hitam', 'size' => 'L', 'cut_type' => 'Regular',
        ]);

        $this->actingAs($admin)->postJson("/api/admin/catalog/products/{$product->id}/variants", [
            'color' => 'Hitam',
            'size' => 'L',
            'cut_type' => 'Regular',
            'material' => 'Cotton Combed 30s',
            'mockup_asset_path' => 'mockups/dup.glb',
        ])->assertUnprocessable();
    }

    public function test_customer_cannot_list_admin_products(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/catalog/products')->assertForbidden();
    }

    public function test_admin_product_list_includes_inactive_products(): void
    {
        $admin = User::factory()->admin()->create();
        Product::factory()->create(['is_active' => true]);
        Product::factory()->create(['is_active' => false]);

        $response = $this->actingAs($admin)->getJson('/api/admin/catalog/products');

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_admin_can_create_a_bulk_pricing_tier(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->postJson('/api/admin/catalog/bulk-pricing-tiers', [
            'min_qty' => 50,
            'max_qty' => 99,
            'price_per_unit' => 45000,
        ]);

        $response->assertCreated()->assertJsonPath('data.min_qty', 50);
    }

    public function test_base_price_must_be_at_least_one(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->postJson('/api/admin/catalog/products', [
            'name_id' => 'Kaos Gratis',
            'name_en' => 'Free Shirt',
            'base_price' => 0,
        ])->assertUnprocessable()->assertJsonValidationErrors('base_price');
    }

    public function test_admin_can_list_product_categories_only(): void
    {
        $admin = User::factory()->admin()->create();
        Category::factory()->product()->create();
        Category::factory()->create(['type' => 'design']);

        $this->actingAs($admin)->getJson('/api/admin/catalog/categories')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonStructure(['data' => [['id', 'name', 'slug']]]);
    }
}
