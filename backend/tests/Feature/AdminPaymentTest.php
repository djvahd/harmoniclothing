<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** GET /admin/payments — FR-032. */
class AdminPaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_list_payments(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/payments')->assertForbidden();
    }

    public function test_admin_can_list_payments_with_order_summary(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create();
        Payment::factory()->for($order)->berhasil()->create();

        $response = $this->actingAs($admin)->getJson('/api/admin/payments');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.order.order_number', $order->order_number);
    }

    public function test_admin_can_filter_payments_by_status(): void
    {
        $admin = User::factory()->admin()->create();
        Payment::factory()->berhasil()->create();
        Payment::factory()->create(['status' => 'belum_dibayar']);

        $response = $this->actingAs($admin)->getJson('/api/admin/payments?status=berhasil');

        $response->assertOk()->assertJsonCount(1, 'data');
    }
}
