<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\BulkPricingTier;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/** 5.2_API_List.md §4 — POST /checkout/bulk (FE-052/056, BR-012/026, Flow 7). */
class BulkCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_bulk_checkout(): void
    {
        $this->postJson('/api/checkout/bulk', [])->assertUnauthorized();
    }

    /** BR-012: price-per-unit is tiered by the TOTAL quantity across mixed sizes, not per size. */
    public function test_bulk_checkout_prices_by_total_quantity_across_sizes(): void
    {
        config(['services.biteship.api_key' => 'test-key']);
        Http::fake(['api.biteship.com/v1/rates/couriers' => Http::response($this->fakeBiteshipRatesResponse())]);

        BulkPricingTier::factory()->create(['min_qty' => 1, 'max_qty' => 49, 'price_per_unit' => 80000]);
        BulkPricingTier::factory()->create(['min_qty' => 50, 'max_qty' => null, 'price_per_unit' => 60000]);

        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $product = Product::factory()->create();
        $variantS = ProductVariant::factory()->for($product)->create(['size' => 'S']);
        $variantM = ProductVariant::factory()->for($product)->create(['size' => 'M']);

        $response = $this->actingAs($user)->postJson('/api/checkout/bulk', [
            'address_id' => $address->id,
            'items' => [
                ['product_variant_id' => $variantS->id, 'quantity' => 30],
                ['product_variant_id' => $variantM->id, 'quantity' => 25],
            ],
            'courier_company' => 'jne',
            'courier_type' => 'reg',
        ]);

        // total qty = 55 -> tiered price 60000/unit applied to every item, + 18000 shipping
        $response->assertCreated()
            ->assertJsonPath('data.type', 'bulk')
            ->assertJsonPath('data.status', 'belum_dibayar')
            ->assertJsonPath('data.shipping_cost', '18000.00')
            ->assertJsonPath('data.total', '3318000.00')
            ->assertJsonCount(2, 'data.items');

        $this->assertDatabaseHas('order_status_histories', [
            'to_status' => 'belum_dibayar',
            'changed_by' => 'customer',
        ]);
    }

    /** Matches BiteshipService::getRates()' parsed shape — a real `pricing[]` response from api.biteship.com/v1/rates/couriers. */
    private function fakeBiteshipRatesResponse(): array
    {
        return [
            'success' => true,
            'pricing' => [
                [
                    'courier_code' => 'jne', 'courier_name' => 'JNE',
                    'courier_service_code' => 'reg', 'courier_service_name' => 'Reguler',
                    'price' => 18000, 'duration' => '1 - 2 days',
                ],
            ],
        ];
    }

    /** BR-026 corollary: Flow 7 is one product per Bulk Order page — mixing variants from different products is rejected. */
    public function test_bulk_checkout_rejects_variants_from_different_products(): void
    {
        BulkPricingTier::factory()->create(['min_qty' => 1, 'max_qty' => null, 'price_per_unit' => 70000]);

        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $variantA = ProductVariant::factory()->create();
        $variantB = ProductVariant::factory()->create();

        $this->actingAs($user)->postJson('/api/checkout/bulk', [
            'address_id' => $address->id,
            'items' => [
                ['product_variant_id' => $variantA->id, 'quantity' => 10],
                ['product_variant_id' => $variantB->id, 'quantity' => 10],
            ],
        ])->assertUnprocessable()->assertJsonValidationErrors('items');
    }

    public function test_bulk_checkout_rejects_an_inactive_product(): void
    {
        BulkPricingTier::factory()->create(['min_qty' => 1, 'max_qty' => null, 'price_per_unit' => 70000]);

        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $product = Product::factory()->inactive()->create();
        $variant = ProductVariant::factory()->for($product)->create();

        $this->actingAs($user)->postJson('/api/checkout/bulk', [
            'address_id' => $address->id,
            'items' => [
                ['product_variant_id' => $variant->id, 'quantity' => 10],
            ],
            'courier_company' => 'jne',
            'courier_type' => 'reg',
        ])->assertUnprocessable()->assertJsonValidationErrors('items');
    }

    public function test_bulk_checkout_rejects_another_users_address(): void
    {
        BulkPricingTier::factory()->create(['min_qty' => 1, 'max_qty' => null, 'price_per_unit' => 70000]);

        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $foreignAddress = Address::factory()->for($otherUser)->create();
        $variant = ProductVariant::factory()->create();

        $this->actingAs($user)->postJson('/api/checkout/bulk', [
            'address_id' => $foreignAddress->id,
            'items' => [
                ['product_variant_id' => $variant->id, 'quantity' => 10],
            ],
        ])->assertUnprocessable()->assertJsonValidationErrors('address_id');
    }

    public function test_bulk_checkout_saves_the_design_file_and_the_order_note(): void
    {
        config(['services.biteship.api_key' => 'test-key']);
        Http::fake(['api.biteship.com/v1/rates/couriers' => Http::response($this->fakeBiteshipRatesResponse())]);
        BulkPricingTier::factory()->create(['min_qty' => 1, 'max_qty' => null, 'price_per_unit' => 70000]);
        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $variant = ProductVariant::factory()->for(Product::factory()->create())->create();
        $design = \App\Models\Design::factory()->create(['status' => 'aktif']);

        $upload = $this->actingAs($user)->postJson('/api/checkout/bulk', [
            'address_id' => $address->id,
            'items' => [['product_variant_id' => $variant->id, 'quantity' => 10]],
            'courier_company' => 'jne', 'courier_type' => 'reg',
            'custom_design_file_path' => 'design-uploads/logo-komunitas.png',
            'notes' => 'Sablon dada kiri, ukuran A5',
        ])->assertCreated();
        $marketplace = $this->actingAs($user)->postJson('/api/checkout/bulk', [
            'address_id' => $address->id,
            'items' => [['product_variant_id' => $variant->id, 'quantity' => 10]],
            'courier_company' => 'jne', 'courier_type' => 'reg',
            'design_id' => $design->id,
        ])->assertCreated();

        $this->assertDatabaseHas('order_items', ['order_id' => $upload->json('data.id'), 'custom_design_file_path' => 'design-uploads/logo-komunitas.png']);
        $this->assertDatabaseHas('orders', ['id' => $upload->json('data.id'), 'notes' => 'Sablon dada kiri, ukuran A5']);
        $this->assertDatabaseHas('order_items', ['order_id' => $marketplace->json('data.id'), 'design_id' => $design->id]);
    }
}
