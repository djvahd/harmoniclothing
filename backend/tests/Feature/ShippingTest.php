<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Order;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** FE-034/035/036/054 — Shipping module. */
class ShippingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.biteship.webhook_token' => 'test-webhook-token']);
    }

    private function webhookUrl(): string
    {
        return '/api/webhooks/biteship?token=test-webhook-token';
    }

    private function orderWithShipment(string $orderStatus, string $shipmentStatus): Order
    {
        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $order = Order::factory()->for($user)->for($address, 'address')->create(['status' => $orderStatus]);
        Shipment::factory()->for($order)->create([
            'biteship_order_id' => 'biteship-test-1',
            'status' => $shipmentStatus,
        ]);

        return $order;
    }

    public function test_webhook_rejects_missing_or_invalid_token(): void
    {
        $this->postJson('/api/webhooks/biteship', ['order_id' => 'biteship-test-1', 'status' => 'delivered'])
            ->assertForbidden();

        $this->postJson('/api/webhooks/biteship?token=wrong', ['order_id' => 'biteship-test-1', 'status' => 'delivered'])
            ->assertForbidden();
    }

    /** Field names + status values match Biteship's real webhook payload (verified 2026-09-08), not app-internal ones. */
    public function test_webhook_moves_order_to_dikirim_when_shipment_ships(): void
    {
        $order = $this->orderWithShipment('diproses_produksi', 'menunggu_pickup');

        $this->postJson($this->webhookUrl(), [
            'order_id' => 'biteship-test-1',
            'status' => 'inTransit',
            'courier_waybill_id' => 'JNE123',
            'courier_company' => 'JNE',
        ])->assertOk();

        $this->assertSame('dikirim', $order->fresh()->status);
        $this->assertSame('dikirim', $order->shipment()->first()->status);
        $this->assertSame('JNE123', $order->shipment()->first()->tracking_number);
    }

    public function test_webhook_moves_order_to_menunggu_konfirmasi_on_delivered(): void
    {
        $order = $this->orderWithShipment('dikirim', 'dikirim');

        $this->postJson($this->webhookUrl(), [
            'order_id' => 'biteship-test-1',
            'status' => 'delivered',
        ])->assertOk();

        $this->assertSame('menunggu_konfirmasi', $order->fresh()->status);
        $this->assertNotNull($order->shipment()->first()->delivered_at);
    }

    public function test_webhook_marks_shipment_bermasalah_and_notifies_admins_without_changing_order_status(): void
    {
        $admin = User::factory()->create(['role' => \App\Enums\UserRole::Admin]);
        $order = $this->orderWithShipment('dikirim', 'dikirim');

        $this->postJson($this->webhookUrl(), [
            'order_id' => 'biteship-test-1',
            'status' => 'rejected',
        ])->assertOk();

        $this->assertSame('bermasalah', $order->shipment()->first()->status);
        $this->assertSame('dikirim', $order->fresh()->status); // order status untouched — BR-014 state machine, admin resolves manually
        $this->assertDatabaseHas('notifications', ['user_id' => $admin->id, 'type' => 'shipment.problem']);
    }

    public function test_webhook_ignores_unrecognized_status(): void
    {
        $order = $this->orderWithShipment('diproses_produksi', 'menunggu_pickup');

        $this->postJson($this->webhookUrl(), ['order_id' => 'biteship-test-1', 'status' => 'someNewStatusBiteshipAdds'])
            ->assertOk();

        $this->assertSame('menunggu_pickup', $order->shipment()->first()->status);
    }

    public function test_webhook_is_idempotent_for_unknown_shipment(): void
    {
        $this->postJson($this->webhookUrl(), ['order_id' => 'nope', 'status' => 'delivered'])
            ->assertOk();
    }

    public function test_customer_can_confirm_received_while_menunggu_konfirmasi(): void
    {
        $order = $this->orderWithShipment('menunggu_konfirmasi', 'delivered');

        $this->actingAs($order->user)
            ->postJson("/api/orders/{$order->id}/confirm-received")
            ->assertOk()
            ->assertJsonPath('data.status', 'selesai');

        $this->assertNotNull($order->fresh()->confirmed_at);
        $this->assertNotNull($order->fresh()->completed_at);
    }

    public function test_confirm_received_rejected_outside_menunggu_konfirmasi(): void
    {
        $order = $this->orderWithShipment('dikirim', 'dikirim');

        $this->actingAs($order->user)
            ->postJson("/api/orders/{$order->id}/confirm-received")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }

    /** BR-014 */
    public function test_auto_complete_command_completes_orders_delivered_over_3_business_days_ago(): void
    {
        $stale = $this->orderWithShipment('menunggu_konfirmasi', 'delivered');
        $stale->shipment->update(['delivered_at' => now()->subDays(10)]);

        $fresh = $this->orderWithShipment('menunggu_konfirmasi', 'delivered');
        $fresh->shipment->update(['delivered_at' => now()]);

        $this->artisan('orders:auto-complete-deliveries')->assertExitCode(0);

        $this->assertSame('selesai', $stale->fresh()->status);
        $this->assertNull($stale->fresh()->confirmed_at); // system-completed, not customer-confirmed (BR-004)
        $this->assertSame('menunggu_konfirmasi', $fresh->fresh()->status);
    }
}
