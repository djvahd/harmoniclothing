<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Admin production queue & order status/reject — FR-021, FR-043. */
class AdminOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_access_production_queue(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/production-queue')->assertForbidden();
    }

    public function test_customer_cannot_list_all_admin_orders(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/orders')->assertForbidden();
    }

    public function test_admin_order_list_includes_every_status_and_buyer(): void
    {
        $admin = User::factory()->admin()->create();
        Order::factory()->menungguApproval()->create();
        Order::factory()->diprosesProduksi()->create();
        Order::factory()->create(['status' => 'selesai']);

        $response = $this->actingAs($admin)->getJson('/api/admin/orders');

        $response->assertOk()->assertJsonCount(3, 'data');
        $this->assertNotNull($response->json('data.0.user.email'));
    }

    public function test_admin_order_list_can_filter_by_status(): void
    {
        $admin = User::factory()->admin()->create();
        Order::factory()->menungguApproval()->create();
        Order::factory()->create(['status' => 'selesai']);

        $response = $this->actingAs($admin)->getJson('/api/admin/orders?status=selesai');

        $response->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'selesai');
    }

    public function test_production_queue_lists_only_relevant_statuses(): void
    {
        $admin = User::factory()->admin()->create();
        Order::factory()->menungguApproval()->create();
        Order::factory()->diprosesProduksi()->create();
        Order::factory()->create(['status' => 'selesai']);

        $response = $this->actingAs($admin)->getJson('/api/admin/production-queue');

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_admin_can_move_an_order_into_production(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->menungguApproval()->create();

        $response = $this->actingAs($admin)->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => 'diproses_produksi',
        ]);

        $response->assertOk()->assertJsonPath('data.status', 'diproses_produksi');
        $this->assertNotNull($order->fresh()->production_started_at);
    }

    public function test_cannot_move_an_order_into_production_from_the_wrong_status(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create(['status' => 'belum_dibayar']);

        $this->actingAs($admin)->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => 'diproses_produksi',
        ])->assertUnprocessable();
    }

    public function test_admin_can_reject_an_order_awaiting_approval(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->menungguApproval()->create();

        $response = $this->actingAs($admin)->postJson("/api/admin/orders/{$order->id}/reject", [
            'reason' => 'Bahan yang diminta sedang habis.',
        ]);

        $response->assertOk()->assertJsonPath('data.status', 'ditolak');
    }

    public function test_reject_requires_a_reason_of_at_least_10_characters(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->menungguApproval()->create();

        $this->actingAs($admin)->postJson("/api/admin/orders/{$order->id}/reject", ['reason' => 'no'])
            ->assertUnprocessable();
    }

    /** 5.3_API_Specification.md §8: 409, not 422, once the order has moved on. */
    public function test_rejecting_an_order_that_already_moved_on_returns_409(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->diprosesProduksi()->create();

        $this->actingAs($admin)->postJson("/api/admin/orders/{$order->id}/reject", [
            'reason' => 'Terlambat menolak pesanan ini.',
        ])->assertStatus(409);
    }

    /** FR-022: booking degrades gracefully without Biteship credentials configured locally. */
    public function test_admin_can_book_a_shipment_for_an_order_in_production(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->diprosesProduksi()->create();

        $response = $this->actingAs($admin)->postJson("/api/admin/orders/{$order->id}/shipment", [
            'courier' => 'jne',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.courier', 'jne')
            ->assertJsonPath('data.status', 'menunggu_pickup');
    }

    public function test_cannot_book_a_shipment_before_production_starts(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->menungguApproval()->create();

        $this->actingAs($admin)->postJson("/api/admin/orders/{$order->id}/shipment", [
            'courier' => 'jne',
        ])->assertUnprocessable();
    }

    public function test_cannot_book_a_second_shipment_for_the_same_order(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->diprosesProduksi()->create();
        $this->actingAs($admin)->postJson("/api/admin/orders/{$order->id}/shipment", ['courier' => 'jne']);

        $this->actingAs($admin)->postJson("/api/admin/orders/{$order->id}/shipment", ['courier' => 'sicepat'])
            ->assertUnprocessable();
    }
}
