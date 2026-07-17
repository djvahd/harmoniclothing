<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\BulkPricingTier;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** 5.2_API_List.md §4 — POST /checkout (FE-027), POST /checkout/bulk (FE-052/056). */
class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_checkout(): void
    {
        $this->postJson('/api/checkout', [])->assertUnauthorized();
    }

    public function test_checkout_creates_an_order_and_clears_the_cart(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $variant = ProductVariant::factory()->create();
        $cartItem = CartItem::factory()->for($user)->for($variant, 'productVariant')->create([
            'quantity' => 2,
            'unit_price_snapshot' => 100000,
        ]);

        $response = $this->actingAs($user)->postJson('/api/checkout', [
            'address_id' => $address->id,
            'cart_item_ids' => [$cartItem->id],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.type', 'reguler')
            ->assertJsonPath('data.status', 'belum_dibayar')
            ->assertJsonPath('data.total', '200000.00')
            ->assertJsonCount(1, 'data.items');

        $this->assertDatabaseMissing('cart_items', ['id' => $cartItem->id]);
        $this->assertDatabaseHas('order_status_histories', [
            'to_status' => 'belum_dibayar',
            'changed_by' => 'customer',
        ]);
    }

    public function test_checkout_rejects_an_inactive_product(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $product = Product::factory()->inactive()->create();
        $variant = ProductVariant::factory()->for($product)->create();
        $cartItem = CartItem::factory()->for($user)->for($variant, 'productVariant')->create();

        $this->actingAs($user)->postJson('/api/checkout', [
            'address_id' => $address->id,
            'cart_item_ids' => [$cartItem->id],
        ])->assertUnprocessable()->assertJsonValidationErrors('cart_item_ids');
    }

    public function test_checkout_rejects_another_users_cart_item(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $otherUser = User::factory()->create();
        $foreignItem = CartItem::factory()->for($otherUser)->create();

        $this->actingAs($user)->postJson('/api/checkout', [
            'address_id' => $address->id,
            'cart_item_ids' => [$foreignItem->id],
        ])->assertUnprocessable()->assertJsonValidationErrors('cart_item_ids.0');
    }

    public function test_bulk_checkout_prices_by_total_quantity_not_cart_snapshot(): void
    {
        BulkPricingTier::factory()->create(['min_qty' => 1, 'max_qty' => 49, 'price_per_unit' => 80000]);
        BulkPricingTier::factory()->create(['min_qty' => 50, 'max_qty' => null, 'price_per_unit' => 60000]);

        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $variantS = ProductVariant::factory()->create();
        $variantM = ProductVariant::factory()->create();
        $itemS = CartItem::factory()->for($user)->for($variantS, 'productVariant')
            ->create(['quantity' => 30, 'unit_price_snapshot' => 999999]);
        $itemM = CartItem::factory()->for($user)->for($variantM, 'productVariant')
            ->create(['quantity' => 25, 'unit_price_snapshot' => 999999]);

        $response = $this->actingAs($user)->postJson('/api/checkout/bulk', [
            'address_id' => $address->id,
            'cart_item_ids' => [$itemS->id, $itemM->id],
        ]);

        // total qty = 55 -> tiered price 60000/unit, not the 999999 cart snapshot
        $response->assertCreated()
            ->assertJsonPath('data.type', 'bulk')
            ->assertJsonPath('data.total', '3300000.00');
    }
}
