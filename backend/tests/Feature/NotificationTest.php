<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/** FR-029/BR-027 — in-app real-time notifications. */
class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_notifications(): void
    {
        $this->getJson('/api/notifications')->assertUnauthorized();
    }

    public function test_user_can_list_only_their_own_notifications(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Notification::factory()->for($user)->count(2)->create();
        Notification::factory()->for($other)->create();

        $this->actingAs($user)->getJson('/api/notifications')->assertJsonCount(2, 'data');
    }

    public function test_user_can_mark_own_notification_read(): void
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->for($user)->create();

        $this->actingAs($user)
            ->patchJson("/api/notifications/{$notification->id}/read")
            ->assertOk()
            ->assertJsonPath('data.is_read', true);
    }

    public function test_user_cannot_mark_another_users_notification_read(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $notification = Notification::factory()->for($owner)->create();

        $this->actingAs($intruder)
            ->patchJson("/api/notifications/{$notification->id}/read")
            ->assertNotFound();
    }

    public function test_payment_success_creates_a_notification_for_the_customer(): void
    {
        Event::fake();
        config(['services.midtrans.server_key' => 'test-server-key']);

        $user = User::factory()->create();
        $address = Address::factory()->for($user)->create();
        $order = Order::factory()->for($user)->for($address, 'address')
            ->create(['order_number' => 'HC-NOTIF-0001', 'total' => 100000]);
        Payment::factory()->for($order)->create(['amount' => 100000]);

        $payload = [
            'order_id' => 'HC-NOTIF-0001',
            'status_code' => '200',
            'gross_amount' => '100000.00',
        ];
        $payload['signature_key'] = hash(
            'sha512',
            $payload['order_id'].$payload['status_code'].$payload['gross_amount'].'test-server-key'
        );

        Http::fake([
            'api.sandbox.midtrans.com/v2/*/status' => Http::response([
                'order_id' => 'HC-NOTIF-0001',
                'status_code' => '200',
                'gross_amount' => '100000.00',
                'transaction_status' => 'settlement',
                'fraud_status' => 'accept',
            ], 200),
        ]);

        $this->postJson('/api/webhooks/midtrans', $payload)->assertOk();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'type' => 'order.paid',
        ]);
    }
}
