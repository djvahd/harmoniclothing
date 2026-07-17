<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** 5.2_API_List.md §3 — /cart (FE-025), BR-025 price snapshot. */
class CartTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_cart(): void
    {
        $this->getJson('/api/cart')->assertUnauthorized();
    }

    public function test_adding_an_item_snapshots_the_current_price(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['base_price' => 100000]);
        $variant = ProductVariant::factory()->for($product)->create(['price_modifier' => 15000]);

        $response = $this->actingAs($user)->postJson('/api/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.unit_price_snapshot', '115000.00')
            ->assertJsonPath('data.subtotal', '230000.00');
    }

    public function test_price_change_after_adding_does_not_affect_existing_cart_item(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['base_price' => 100000]);
        $variant = ProductVariant::factory()->for($product)->create(['price_modifier' => 0]);

        $response = $this->actingAs($user)->postJson('/api/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);
        $itemId = $response->json('data.id');

        $product->update(['base_price' => 999999]); // BR-025: admin changes price later

        $this->actingAs($user)->getJson('/api/cart')
            ->assertJsonPath('data.0.unit_price_snapshot', '100000.00');

        $this->assertNotNull($itemId);
    }

    public function test_user_can_update_quantity_and_notes(): void
    {
        $user = User::factory()->create();
        $variant = ProductVariant::factory()->create();
        $itemId = $this->actingAs($user)->postJson('/api/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ])->json('data.id');

        $this->actingAs($user)
            ->patchJson("/api/cart/{$itemId}", ['quantity' => 5, 'notes' => 'Tolong rapi'])
            ->assertOk()
            ->assertJsonPath('data.quantity', 5)
            ->assertJsonPath('data.notes', 'Tolong rapi');
    }

    public function test_user_can_remove_a_cart_item(): void
    {
        $user = User::factory()->create();
        $variant = ProductVariant::factory()->create();
        $itemId = $this->actingAs($user)->postJson('/api/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ])->json('data.id');

        $this->actingAs($user)->deleteJson("/api/cart/{$itemId}")->assertOk();
        $this->actingAs($user)->getJson('/api/cart')->assertJsonCount(0, 'data');
    }

    public function test_user_cannot_modify_another_users_cart_item(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $variant = ProductVariant::factory()->create();
        $itemId = $this->actingAs($owner)->postJson('/api/cart', [
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ])->json('data.id');

        $this->actingAs($intruder)
            ->patchJson("/api/cart/{$itemId}", ['quantity' => 2])
            ->assertNotFound();

        $this->actingAs($intruder)
            ->deleteJson("/api/cart/{$itemId}")
            ->assertNotFound();
    }
}
