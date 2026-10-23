<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\User;
use App\Services\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
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
        ], $overrides);

        $payload['signature_key'] = hash(
            'sha512',
            $payload['order_id'].$payload['status_code'].$payload['gross_amount'].'test-server-key'
        );

        return $payload;
    }

    /**
     * The webhook now re-fetches the authoritative transaction status from
     * Midtrans server-to-server rather than trusting the notification body, so
     * tests fake that outbound call instead of relying on the POSTed payload.
     */
    private function fakeMidtransStatus(array $overrides = []): void
    {
        $status = array_merge([
            'order_id' => 'HC-20260101-0001',
            'status_code' => '200',
            'gross_amount' => '100000.00',
            'transaction_status' => 'settlement',
            'fraud_status' => 'accept',
            'transaction_id' => 'trx-1',
            'payment_type' => 'bank_transfer',
        ], $overrides);

        Http::fake([
            'api.sandbox.midtrans.com/v2/*/status' => Http::response($status, 200),
        ]);
    }

    public function test_webhook_rejects_invalid_signature(): void
    {
        $payload = $this->signedPayload();
        $payload['signature_key'] = 'wrong';

        $this->postJson('/api/webhooks/midtrans', $payload)->assertForbidden();
    }

    public function test_webhook_rejects_a_payload_missing_signed_fields_instead_of_erroring(): void
    {
        $this->postJson('/api/webhooks/midtrans', [])->assertForbidden();
        $this->postJson('/api/webhooks/midtrans', ['signature_key' => 'x'])->assertForbidden();
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

        $this->fakeMidtransStatus();

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

        $this->fakeMidtransStatus(['transaction_status' => 'deny', 'fraud_status' => null]);

        $this->postJson('/api/webhooks/midtrans', $this->signedPayload())->assertOk();

        $this->assertSame('gagal', $order->payment()->first()->status);
        $this->assertSame('belum_dibayar', $order->fresh()->status);
    }

    public function test_webhook_treats_challenged_capture_as_pending_not_paid(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $order = Order::factory()->for($user)->for($address, 'address')->create([
            'order_number' => 'HC-20260101-0001',
            'total' => 100000,
        ]);
        Payment::factory()->for($order)->create(['amount' => 100000]);

        $this->fakeMidtransStatus(['transaction_status' => 'capture', 'fraud_status' => 'challenge']);

        $this->postJson('/api/webhooks/midtrans', $this->signedPayload())->assertOk();

        $this->assertSame('belum_dibayar', $order->fresh()->status);
        $this->assertNotSame('berhasil', $order->payment()->first()->status);
    }

    public function test_webhook_treats_accepted_capture_as_paid(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $order = Order::factory()->for($user)->for($address, 'address')->create([
            'order_number' => 'HC-20260101-0001',
            'total' => 100000,
        ]);
        Payment::factory()->for($order)->create(['amount' => 100000]);

        $this->fakeMidtransStatus(['transaction_status' => 'capture', 'fraud_status' => 'accept']);

        $this->postJson('/api/webhooks/midtrans', $this->signedPayload())->assertOk();

        $this->assertSame('menunggu_approval', $order->fresh()->status);
        $this->assertSame('berhasil', $order->payment()->first()->status);
    }

    public function test_webhook_is_idempotent_for_an_unknown_order(): void
    {
        $this->fakeMidtransStatus(['order_id' => 'HC-NOPE']);

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

        $this->fakeMidtransStatus();

        $this->postJson('/api/webhooks/midtrans', $this->signedPayload())->assertOk();

        $this->actingAs($user)->getJson("/api/orders/{$order->id}/invoice")
            ->assertOk()
            ->assertJsonStructure(['data' => ['invoice_number', 'issued_at']]);
    }

    public function test_snap_request_carries_customer_items_callback_and_expiry(): void
    {
        config(['app.frontend_url' => 'https://app.example.test']);
        Http::fake(['app.sandbox.midtrans.com/*' => Http::response(['redirect_url' => 'https://pay.test/x'], 201)]);

        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $order = Order::factory()->for($user)->for($address, 'address')->create([
            'order_number' => 'HC-20260101-0002',
            'subtotal' => 90000,
            'shipping_cost' => 10000,
            'total' => 100000,
        ]);
        OrderItem::factory()->for($order)->create(['quantity' => 2, 'unit_price' => 45000, 'subtotal' => 90000]);

        $url = app(MidtransService::class)->createSnapTransaction($order);

        $this->assertSame('https://pay.test/x', $url);
        Http::assertSent(function ($request) use ($order, $user) {
            $d = $request->data();

            return $d['callbacks']['finish'] === "https://app.example.test/account/orders/{$order->id}"
                && $d['expiry']['duration'] === 24
                && $d['customer_details']['email'] === $user->email
                && count($d['item_details']) === 2
                && $d['transaction_details']['gross_amount'] === 100000;
        });
    }

    public function test_snap_request_omits_item_details_that_do_not_add_up(): void
    {
        Http::fake(['app.sandbox.midtrans.com/*' => Http::response(['redirect_url' => 'https://pay.test/y'], 201)]);

        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $order = Order::factory()->for($user)->for($address, 'address')->create(['total' => 99999, 'shipping_cost' => 0]);
        OrderItem::factory()->for($order)->create(['quantity' => 1, 'unit_price' => 50000]);

        app(MidtransService::class)->createSnapTransaction($order);

        Http::assertSent(fn ($request) => ! array_key_exists('item_details', $request->data()));
    }
}
