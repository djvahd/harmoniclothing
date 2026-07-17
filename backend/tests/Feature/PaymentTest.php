<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * 5.3_API_Specification.md §8 POST /webhooks/midtrans — FE-032/033.
 */
class PaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.midtrans.server_key' => 'test-server-key']);
    }

    private function signedPayload(array $overrides = []): array
    {
        $payload = array_merge([
            'order_id' => 'HC-20260101-0001',
            'status_code' => '200',
            'gross_amount' => '100000.00',
            'transaction_status' => 'settlement',
            'transaction_id' => 'trx-1',
            'payment_type' => 'bank_transfer',
        ], $overrides);

        $payload['signature_key'] = hash(
            'sha512',
            $payload['order_id'].$payload['status_code'].$payload['gross_amount'].'test-server-key'
        );

        return $payload;
    }

    public function test_webhook_rejects_invalid_signature(): void
    {
        $payload = $this->signedPayload();
        $payload['signature_key'] = 'wrong';

        $this->postJson('/api/webhooks/midtrans', $payload)->assertForbidden();
    }

    public function test_webhook_marks_order_paid_and_generates_invoice_on_settlement(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $order = Order::factory()->for($user)->for($address, 'address')->create([
            'order_number' => 'HC-20260101-0001',
            'total' => 100000,
        ]);
        Payment::factory()->for($order)->create(['amount' => 100000]);

        $this->postJson('/api/webhooks/midtrans', $this->signedPayload())->assertOk();

        $this->assertSame('menunggu_approval', $order->fresh()->status);
        $this->assertSame('berhasil', $order->payment()->first()->status);
        $this->assertNotNull($order->fresh()->invoice);
        $this->assertDatabaseHas('order_status_histories', [
            'order_id' => $order->id,
            'from_status' => 'belum_dibayar',
            'to_status' => 'menunggu_approval',
            'changed_by' => 'system',
        ]);
    }

    public function test_webhook_marks_payment_failed_on_deny_without_advancing_order(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $order = Order::factory()->for($user)->for($address, 'address')->create([
            'order_number' => 'HC-20260101-0001',
            'total' => 100000,
        ]);
        Payment::factory()->for($order)->create(['amount' => 100000]);

        $this->postJson('/api/webhooks/midtrans', $this->signedPayload(['transaction_status' => 'deny']))
            ->assertOk();

        $this->assertSame('gagal', $order->payment()->first()->status);
        $this->assertSame('belum_dibayar', $order->fresh()->status);
    }

    public function test_webhook_is_idempotent_for_an_unknown_order(): void
    {
        $this->postJson('/api/webhooks/midtrans', $this->signedPayload(['order_id' => 'HC-NOPE']))
            ->assertOk();
    }

    public function test_invoice_endpoint_404s_until_paid(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $order = Order::factory()->for($user)->for($address, 'address')->create([
            'order_number' => 'HC-20260101-0001',
            'total' => 100000,
        ]);
        Payment::factory()->for($order)->create(['amount' => 100000]);

        $this->actingAs($user)->getJson("/api/orders/{$order->id}/invoice")->assertNotFound();

        $this->postJson('/api/webhooks/midtrans', $this->signedPayload())->assertOk();

        $this->actingAs($user)->getJson("/api/orders/{$order->id}/invoice")
            ->assertOk()
            ->assertJsonStructure(['data' => ['invoice_number', 'issued_at']]);
    }
}
