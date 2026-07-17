<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** FR-027/BR-004 — Rating & Review, per item, only after "selesai". */
class ReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_review_rejected_before_order_is_selesai(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $order = Order::factory()->for($user)->for($address, 'address')->create(['status' => 'dikirim']);
        $item = OrderItem::factory()->for($order)->create();

        $this->actingAs($user)->postJson("/api/orders/{$order->id}/reviews", [
            'order_item_id' => $item->id,
            'rating' => 5,
        ])->assertUnprocessable();
    }

    public function test_customer_can_review_an_item_after_order_selesai(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $order = Order::factory()->for($user)->for($address, 'address')->create(['status' => 'selesai']);
        $item = OrderItem::factory()->for($order)->create();

        $response = $this->actingAs($user)->postJson("/api/orders/{$order->id}/reviews", [
            'order_item_id' => $item->id,
            'rating' => 4,
            'comment' => 'Bagus, cepat sampai.',
        ]);

        $response->assertCreated()->assertJsonPath('data.rating', 4);
    }

    public function test_item_cannot_be_reviewed_twice(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $order = Order::factory()->for($user)->for($address, 'address')->create(['status' => 'selesai']);
        $item = OrderItem::factory()->for($order)->create();

        $this->actingAs($user)->postJson("/api/orders/{$order->id}/reviews", [
            'order_item_id' => $item->id,
            'rating' => 5,
        ])->assertCreated();

        $this->actingAs($user)->postJson("/api/orders/{$order->id}/reviews", [
            'order_item_id' => $item->id,
            'rating' => 3,
        ])->assertUnprocessable();
    }

    public function test_cannot_review_an_item_from_another_users_order(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $ownerAddress = Address::factory()->for($owner)->create();
        $order = Order::factory()->for($owner)->for($ownerAddress, 'address')->create(['status' => 'selesai']);
        $item = OrderItem::factory()->for($order)->create();

        $this->actingAs($intruder)->postJson("/api/orders/{$order->id}/reviews", [
            'order_item_id' => $item->id,
            'rating' => 5,
        ])->assertNotFound();
    }
}
