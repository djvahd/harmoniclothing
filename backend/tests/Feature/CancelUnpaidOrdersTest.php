<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** BR-017 — auto-cancel orders unpaid 24h after checkout. */
class CancelUnpaidOrdersTest extends TestCase
{
    use RefreshDatabase;

    public function test_cancels_orders_unpaid_for_over_24_hours(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $stale = Order::factory()->for($user)->for($address, 'address')
            ->create(['created_at' => now()->subHours(25)]);
        $fresh = Order::factory()->for($user)->for($address, 'address')
            ->create(['created_at' => now()->subHours(1)]);

        $this->artisan('orders:cancel-unpaid')->assertExitCode(0);

        $this->assertSame('dibatalkan', $stale->fresh()->status);
        $this->assertSame('system', $stale->fresh()->cancelled_by);
        $this->assertSame('belum_dibayar', $fresh->fresh()->status);

        $this->assertDatabaseHas('order_status_histories', [
            'order_id' => $stale->id,
            'to_status' => 'dibatalkan',
            'changed_by' => 'system',
        ]);
    }

    public function test_does_not_touch_orders_already_past_belum_dibayar(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $order = Order::factory()->for($user)->for($address, 'address')
            ->menungguApproval()
            ->create(['created_at' => now()->subHours(48)]);

        $this->artisan('orders:cancel-unpaid');

        $this->assertSame('menunggu_approval', $order->fresh()->status);
    }
}
