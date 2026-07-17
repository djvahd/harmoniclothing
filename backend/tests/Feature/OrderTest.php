<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** 5.2_API_List.md §4 — /orders (FE-028/029/031). */
class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_orders(): void
    {
        $this->getJson('/api/orders')->assertUnauthorized();
    }

    public function test_user_can_list_only_their_own_orders(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Order::factory()->for($user)->for(Address::factory()->for($user), 'address')->count(2)->create();
        Order::factory()->for($other)->for(Address::factory()->for($other), 'address')->create();

        $this->actingAs($user)->getJson('/api/orders')->assertJsonCount(2, 'data');
    }

    public function test_user_cannot_view_another_users_order(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $order = Order::factory()->for($owner)->for(Address::factory()->for($owner), 'address')->create();

        $this->actingAs($intruder)->getJson("/api/orders/{$order->id}")->assertNotFound();
    }

    /** BR-010: cancellable only while "menunggu_approval". */
    public function test_order_can_be_cancelled_while_menunggu_approval(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->for($user)->for(Address::factory()->for($user), 'address')
            ->menungguApproval()->create();

        $this->actingAs($user)->postJson("/api/orders/{$order->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'dibatalkan');

        $this->assertDatabaseHas('order_status_histories', [
            'order_id' => $order->id,
            'to_status' => 'dibatalkan',
        ]);
    }

    public function test_order_cannot_be_cancelled_once_in_production(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->for($user)->for(Address::factory()->for($user), 'address')
            ->diprosesProduksi()->create();

        $this->actingAs($user)->postJson("/api/orders/{$order->id}/cancel")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }

    public function test_reorder_adds_items_back_to_cart_at_current_price(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['base_price' => 100000]);
        $variant = ProductVariant::factory()->for($product)->create(['price_modifier' => 0]);
        $order = Order::factory()->for($user)->for(Address::factory()->for($user), 'address')->create();
        OrderItem::factory()->for($order)->for($variant, 'productVariant')->create(['quantity' => 3]);

        $product->update(['base_price' => 150000]); // price moved on since the original order

        $response = $this->actingAs($user)->postJson("/api/orders/{$order->id}/reorder");

        $response->assertCreated()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.unit_price_snapshot', '150000.00');

        $this->actingAs($user)->getJson('/api/cart')->assertJsonCount(1, 'data');
    }

    public function test_reorder_skips_items_whose_product_is_now_inactive(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->inactive()->create();
        $variant = ProductVariant::factory()->for($product)->create();
        $order = Order::factory()->for($user)->for(Address::factory()->for($user), 'address')->create();
        OrderItem::factory()->for($order)->for($variant, 'productVariant')->create();

        $this->actingAs($user)->postJson("/api/orders/{$order->id}/reorder")
            ->assertCreated()
            ->assertJsonCount(0, 'data');
    }
}
