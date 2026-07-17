<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** 5.2_API_List.md §3 — /wishlist (FE-030), BR-024 availability badge. */
class WishlistTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_wishlist(): void
    {
        $this->getJson('/api/wishlist')->assertUnauthorized();
    }

    public function test_user_can_add_and_list_a_product_to_wishlist(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)->postJson('/api/wishlist', ['product_id' => $product->id])
            ->assertCreated();

        $this->actingAs($user)->getJson('/api/wishlist')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.is_available', true);
    }

    /** BR-024: not removed automatically, badge computed at query time. */
    public function test_wishlist_marks_inactive_product_as_unavailable(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $this->actingAs($user)->postJson('/api/wishlist', ['product_id' => $product->id]);

        $product->update(['is_active' => false]);

        $this->actingAs($user)->getJson('/api/wishlist')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.is_available', false);
    }

    public function test_user_can_remove_own_wishlist_item(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $itemId = $this->actingAs($user)->postJson('/api/wishlist', ['product_id' => $product->id])
            ->json('data.id');

        $this->actingAs($user)->deleteJson("/api/wishlist/{$itemId}")->assertOk();
        $this->actingAs($user)->getJson('/api/wishlist')->assertJsonCount(0, 'data');
    }

    public function test_user_cannot_remove_another_users_wishlist_item(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $product = Product::factory()->create();
        $itemId = $this->actingAs($owner)->postJson('/api/wishlist', ['product_id' => $product->id])
            ->json('data.id');

        $this->actingAs($intruder)->deleteJson("/api/wishlist/{$itemId}")->assertNotFound();
    }
}
