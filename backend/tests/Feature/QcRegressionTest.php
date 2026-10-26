<?php

namespace Tests\Feature;

use App\Enums\UserStatus;
use App\Http\Middleware\EnsureSessionIsCurrent;
use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotification;
use Illuminate\Http\Request;
use App\Models\Address;
use App\Models\BulkPricingTier;
use App\Models\CartItem;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use App\Models\Product;
use App\Models\CreatorProfile;
use App\Models\Commission;
use App\Models\Design;
use App\Models\Notification;
use App\Models\Shipment;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\DataProvider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Regression tests for bugs found by the 2026-10 QC pass (Required Document/QC_Claude_Hasil.xlsx). */
class QcRegressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_banned_user_cannot_log_in(): void
    {
        $user = User::factory()->create(['status' => UserStatus::Banned]);

        $this->withHeader('Origin', 'http://localhost:3000')
            ->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'password'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertGuest();
    }

    public function test_existing_session_of_a_user_banned_afterwards_is_rejected(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->getJson('/api/me')->assertOk();

        $user->forceFill(['status' => UserStatus::Banned])->save();

        $this->actingAs($user->fresh())->getJson('/api/me')->assertForbidden();
    }

    public function test_active_design_cannot_be_resubmitted_for_review(): void
    {
        $creator = CreatorProfile::factory()->aktif()->create()->user;
        $design = Design::factory()->create(['creator_id' => $creator->id, 'status' => 'aktif']);

        $this->actingAs($creator)->postJson("/api/creator/designs/{$design->id}/submit")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        $this->assertSame('aktif', $design->fresh()->status);
    }

    public function test_invalid_birth_date_in_creator_verification_is_422_not_500(): void
    {
        $user = CreatorProfile::factory()->menungguApproval()->create()->user;

        $this->actingAs($user)->postJson('/api/creator/verification', ['birth_date' => 'bukan-tanggal'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('birth_date');
    }

    private function unpaidOrder(User $user, array $paymentAttrs = []): Order
    {
        $order = Order::factory()->for($user)->for(Address::factory()->for($user), 'address')->create(['status' => 'belum_dibayar']);
        Payment::factory()->for($order)->create(['status' => 'belum_dibayar', ...$paymentAttrs]);

        return $order;
    }

    public function test_customer_can_cancel_an_unpaid_order(): void
    {
        $user = User::factory()->create();
        $order = $this->unpaidOrder($user);

        $this->actingAs($user)->postJson("/api/orders/{$order->id}/cancel")->assertOk();

        $this->assertSame('dibatalkan', $order->fresh()->status);
        $this->assertSame('gagal', $order->payment()->first()->status);
    }

    public function test_pay_returns_the_saved_snap_url_for_an_unpaid_order(): void
    {
        $user = User::factory()->create();
        $order = $this->unpaidOrder($user, ['snap_redirect_url' => 'https://app.sandbox.midtrans.com/snap/v4/redirection/abc']);

        $this->actingAs($user)->postJson("/api/orders/{$order->id}/pay")
            ->assertOk()
            ->assertJsonPath('data.midtrans_redirect_url', 'https://app.sandbox.midtrans.com/snap/v4/redirection/abc');
    }

    public function test_pay_is_rejected_for_an_order_that_is_not_unpaid(): void
    {
        $user = User::factory()->create();
        $order = $this->unpaidOrder($user);
        $order->update(['status' => 'menunggu_approval']);

        $this->actingAs($user)->postJson("/api/orders/{$order->id}/pay")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }

    public function test_invoice_endpoint_includes_the_order_items(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->for($user)->for(Address::factory()->for($user), 'address')->create(['status' => 'menunggu_approval']);
        OrderItem::factory()->count(2)->for($order)->create();
        Invoice::factory()->for($order)->create();

        $this->actingAs($user)->getJson("/api/orders/{$order->id}/invoice")
            ->assertOk()
            ->assertJsonCount(2, 'data.order.items');
    }

    public function test_order_detail_exposes_the_status_history_for_the_timeline(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->for($user)->for(Address::factory()->for($user), 'address')->create(['status' => 'menunggu_approval']);
        OrderStatusHistory::factory()->for($order)->create(['from_status' => 'belum_dibayar', 'to_status' => 'menunggu_approval']);

        $this->actingAs($user)->getJson("/api/orders/{$order->id}")
            ->assertOk()
            ->assertJsonPath('data.status_history.0.status', 'menunggu_approval')
            ->assertJsonStructure(['data' => ['status_history' => [['status', 'at']]]]);
    }

    public function test_session_stays_valid_across_requests_but_ends_after_a_password_change(): void
    {
        $user = User::factory()->create();
        $session = app('session')->driver('array');
        $pass = fn () => (new EnsureSessionIsCurrent)->handle(
            tap(Request::create('/api/me'), function (Request $r) use ($session, $user) {
                $r->setLaravelSession($session);
                $r->setUserResolver(fn () => $user);
            }),
            fn () => response('ok'),
        );

        $this->assertSame(200, $pass()->getStatusCode()); // first request stores the fingerprint
        $this->assertSame(200, $pass()->getStatusCode()); // and later requests keep passing

        $user->forceFill(['password' => 'password-baru-123'])->save();

        $this->assertSame(401, $pass()->getStatusCode()); // password changed: session is ended
    }

    public function test_overlapping_bulk_pricing_tier_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        BulkPricingTier::factory()->create(['min_qty' => 10, 'max_qty' => 49, 'price_per_unit' => 80000]);
        BulkPricingTier::factory()->create(['min_qty' => 50, 'max_qty' => null, 'price_per_unit' => 70000]);

        foreach ([[1, 10], [20, 30], [5, 60], [100, null]] as [$min, $max]) {
            $this->actingAs($admin)->postJson('/api/admin/catalog/bulk-pricing-tiers', [
                'min_qty' => $min, 'max_qty' => $max, 'price_per_unit' => 60000,
            ])->assertUnprocessable()->assertJsonValidationErrors('min_qty');
        }

        $this->actingAs($admin)->postJson('/api/admin/catalog/bulk-pricing-tiers', [
            'min_qty' => 1, 'max_qty' => 9, 'price_per_unit' => 90000,
        ])->assertCreated();
    }

    public function test_revenue_excludes_payments_of_rejected_and_cancelled_orders(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        foreach ([['selesai', 100000], ['ditolak', 50000], ['dibatalkan', 30000]] as [$status, $amount]) {
            $order = Order::factory()->for($user)->for(Address::factory()->for($user), 'address')->create(['status' => $status, 'total' => $amount]);
            Payment::factory()->for($order)->create(['status' => 'berhasil', 'amount' => $amount, 'paid_at' => now()]);
        }

        $this->actingAs($admin)->getJson('/api/admin/dashboard')->assertOk()->assertJsonPath('data.revenue.total', '100000.00');
        $this->actingAs($admin)->getJson('/api/admin/reports/sales')->assertOk()->assertJsonPath('data.revenue.total', '100000.00');
    }

    public function test_adding_the_same_wishlist_item_twice_creates_one_row(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)->postJson('/api/wishlist', ['product_id' => $product->id])->assertSuccessful();
        $this->actingAs($user)->postJson('/api/wishlist', ['product_id' => $product->id])->assertSuccessful();

        $this->assertSame(1, $user->wishlists()->count());
    }

    public function test_password_reset_email_links_to_the_frontend_reset_page(): void
    {
        $user = User::factory()->create(['email' => 'reset.link@example.com']);
        config(['app.frontend_url' => 'https://app.example.test']);

        $mail = (new ResetPasswordNotification('tok123'))->toMail($user);

        $this->assertSame('https://app.example.test/reset-password?token=tok123&email=reset.link%40example.com', $mail->actionUrl);
    }

    public function test_auth_endpoints_are_limited_to_20_requests_per_minute_per_ip(): void
    {
        for ($i = 1; $i <= 20; $i++) {
            $this->postJson('/api/auth/forgot-password', ['email' => "rl{$i}@example.com"])->assertOk();
        }

        $this->postJson('/api/auth/forgot-password', ['email' => 'rl21@example.com'])
            ->assertStatus(429)
            ->assertJsonPath('message', __('messages.http.too_many_requests'));
    }

    public function test_missing_kyc_file_answers_404_not_500(): void
    {
        $admin = User::factory()->admin()->create();
        $profile = CreatorProfile::factory()->create(['ktp_photo_path' => 'kyc-uploads/not-there.jpg']);

        $this->actingAs($admin)->getJson("/api/admin/creators/{$profile->id}/kyc-document")->assertNotFound();
    }

    public function test_unknown_notification_type_cannot_be_configured(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->patchJson('/api/admin/notification-settings/not.a.type', ['is_enabled' => false])->assertNotFound();
        $this->assertDatabaseMissing('notification_settings', ['notification_type' => 'not.a.type']);
    }

    public function test_email_is_case_insensitive_at_registration_and_login(): void
    {
        $this->withHeader('Origin', 'http://localhost:3000')->postJson('/api/auth/register', [
            'name' => 'Case Test', 'email' => 'Mixed.Case@Example.com',
            'password' => 'password123', 'password_confirmation' => 'password123',
            'privacy_accepted' => true, 'terms_accepted' => true,
        ])->assertSuccessful();

        $this->assertDatabaseHas('users', ['email' => 'mixed.case@example.com']);

        $this->postJson('/api/auth/register', [
            'name' => 'Case Dup', 'email' => 'MIXED.CASE@example.com',
            'password' => 'password123', 'password_confirmation' => 'password123',
            'privacy_accepted' => true, 'terms_accepted' => true,
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_cart_item_with_design_of_banned_creator_is_unavailable(): void
    {
        $creator = User::factory()->create();
        $design = Design::factory()->create(['creator_id' => $creator->id, 'status' => 'aktif']);
        $item = CartItem::factory()->create(['design_id' => $design->id]);

        $this->assertTrue($item->fresh()->isAvailable());

        $creator->forceFill(['status' => UserStatus::Banned])->save();

        $this->assertFalse($item->fresh()->isAvailable());
    }

    public function test_admin_cannot_use_cart_wishlist_or_checkout(): void
    {
        $admin = User::factory()->admin()->create();
        $product = Product::factory()->create();

        $this->actingAs($admin)->postJson('/api/cart', ['product_id' => $product->id])->assertForbidden();
        $this->actingAs($admin)->getJson('/api/cart')->assertForbidden();
        $this->actingAs($admin)->postJson('/api/wishlist', ['product_id' => $product->id])->assertForbidden();
        $this->actingAs($admin)->postJson('/api/checkout', [])->assertForbidden();
        $this->actingAs($admin)->getJson('/api/admin/dashboard')->assertOk();
    }

    public function test_replayed_settlement_webhook_creates_one_commission_one_invoice_and_one_notification(): void
    {
        config(['services.midtrans.server_key' => 'test-server-key']);
        $creator = CreatorProfile::factory()->aktif()->create()->user;
        $design = Design::factory()->for($creator, 'creator')->create();
        $customer = User::factory()->create();
        $order = Order::factory()->for($customer)->for(Address::factory()->for($customer), 'address')
            ->create(['order_number' => 'HC-REPLAY-0001', 'total' => 100000]);
        Payment::factory()->for($order)->create(['amount' => 100000]);
        OrderItem::factory()->for($order)->create(['design_id' => $design->id, 'subtotal' => 100000]);

        Http::fake([
            'api.sandbox.midtrans.com/v2/*/status' => Http::response([
                'order_id' => 'HC-REPLAY-0001', 'status_code' => '200', 'gross_amount' => '100000.00',
                'transaction_status' => 'settlement', 'fraud_status' => 'accept',
            ], 200),
        ]);
        $payload = ['order_id' => 'HC-REPLAY-0001', 'status_code' => '200', 'gross_amount' => '100000.00'];
        $payload['signature_key'] = hash('sha512', 'HC-REPLAY-0001'.'200'.'100000.00'.'test-server-key');

        $this->postJson('/api/webhooks/midtrans', $payload)->assertOk();
        $this->postJson('/api/webhooks/midtrans', $payload)->assertOk();

        $this->assertSame(1, Commission::where('creator_id', $creator->id)->count());
        $this->assertSame(1, Invoice::where('order_id', $order->id)->count());
        $this->assertSame(1, Notification::where('user_id', $customer->id)->where('type', 'order.paid')->count());
        $this->assertSame(1, OrderStatusHistory::where('order_id', $order->id)->where('to_status', 'menunggu_approval')->count());
    }

    #[DataProvider('biteshipStatuses')]
    public function test_biteship_status_maps_to_the_shipment_status(string $biteship, string $expected): void
    {
        config(['services.biteship.webhook_token' => 't']);
        $user = User::factory()->create();
        $order = Order::factory()->for($user)->for(Address::factory()->for($user), 'address')->create(['status' => 'diproses_produksi']);
        Shipment::factory()->for($order)->create(['biteship_order_id' => 'bs-1', 'status' => 'menunggu_pickup']);

        $this->postJson('/api/webhooks/biteship?token=t', ['order_id' => 'bs-1', 'status' => $biteship])->assertOk();

        $this->assertSame($expected, $order->shipment()->first()->status);
    }

    public static function biteshipStatuses(): array
    {
        $map = [
            'confirmed' => 'menunggu_pickup', 'allocated' => 'menunggu_pickup', 'pickingUp' => 'menunggu_pickup', 'picked' => 'menunggu_pickup',
            'inTransit' => 'dikirim', 'droppingOff' => 'dikirim', 'delivered' => 'delivered',
            'returnInTransit' => 'bermasalah', 'onHold' => 'bermasalah', 'rejected' => 'bermasalah', 'courierNotFound' => 'bermasalah',
            'returned' => 'bermasalah', 'cancelled' => 'bermasalah', 'disposed' => 'bermasalah',
        ];

        return array_map(null, array_keys($map), array_values($map));
    }

    public function test_repeated_or_backward_biteship_webhooks_do_not_break_the_order_status(): void
    {
        config(['services.biteship.webhook_token' => 't']);
        $user = User::factory()->create();
        $order = Order::factory()->for($user)->for(Address::factory()->for($user), 'address')->create(['status' => 'diproses_produksi']);
        Shipment::factory()->for($order)->create(['biteship_order_id' => 'bs-2', 'status' => 'menunggu_pickup']);
        $hit = fn (string $status) => $this->postJson('/api/webhooks/biteship?token=t', ['order_id' => 'bs-2', 'status' => $status])->assertOk();

        $hit('inTransit');
        $hit('inTransit'); // duplicate
        $this->assertSame('dikirim', $order->fresh()->status);
        $this->assertSame(1, OrderStatusHistory::where('order_id', $order->id)->where('to_status', 'dikirim')->count());

        $hit('delivered');
        $hit('inTransit'); // late, out-of-order event
        $this->assertSame('menunggu_konfirmasi', $order->fresh()->status);
        $this->assertSame(1, OrderStatusHistory::where('order_id', $order->id)->where('to_status', 'menunggu_konfirmasi')->count());
    }

    #[DataProvider('midtransStatuses')]
    public function test_midtrans_status_maps_to_the_payment_status(string $transaction, ?string $fraud, string $payment, string $order): void
    {
        config(['services.midtrans.server_key' => 'test-server-key']);
        $user = User::factory()->create();
        $o = Order::factory()->for($user)->for(Address::factory()->for($user), 'address')->create(['order_number' => 'HC-MAP-0001', 'total' => 100000]);
        Payment::factory()->for($o)->create(['amount' => 100000]);
        Http::fake([
            'api.sandbox.midtrans.com/v2/*/status' => Http::response([
                'order_id' => 'HC-MAP-0001', 'status_code' => '200', 'gross_amount' => '100000.00',
                'transaction_status' => $transaction, 'fraud_status' => $fraud,
            ], 200),
        ]);
        $payload = ['order_id' => 'HC-MAP-0001', 'status_code' => '200', 'gross_amount' => '100000.00'];
        $payload['signature_key'] = hash('sha512', 'HC-MAP-0001'.'200'.'100000.00'.'test-server-key');

        $this->postJson('/api/webhooks/midtrans', $payload)->assertOk();

        $this->assertSame($payment, $o->payment()->first()->status);
        $this->assertSame($order, $o->fresh()->status);
    }

    public static function midtransStatuses(): array
    {
        return [
            'settlement' => ['settlement', 'accept', 'berhasil', 'menunggu_approval'],
            'capture accept' => ['capture', 'accept', 'berhasil', 'menunggu_approval'],
            'pending' => ['pending', null, 'belum_dibayar', 'belum_dibayar'],
            'deny' => ['deny', null, 'gagal', 'belum_dibayar'],
            'cancel' => ['cancel', null, 'gagal', 'belum_dibayar'],
            'expire' => ['expire', null, 'gagal', 'belum_dibayar'],
        ];
    }

    #[DataProvider('bulkBoundaries')]
    public function test_bulk_tier_price_at_every_boundary(int $qty, ?string $price): void
    {
        BulkPricingTier::factory()->create(['min_qty' => 1, 'max_qty' => 49, 'price_per_unit' => 80000]);
        BulkPricingTier::factory()->create(['min_qty' => 50, 'max_qty' => 99, 'price_per_unit' => 70000]);
        BulkPricingTier::factory()->create(['min_qty' => 100, 'max_qty' => 249, 'price_per_unit' => 60000]);
        BulkPricingTier::factory()->create(['min_qty' => 250, 'max_qty' => null, 'price_per_unit' => 50000]);

        $this->assertSame($price, (new \App\Services\PricingService)->bulkUnitPriceFor($qty));
    }

    public static function bulkBoundaries(): array
    {
        return [
            [1, '80000.00'], [49, '80000.00'], [50, '70000.00'], [99, '70000.00'],
            [100, '60000.00'], [249, '60000.00'], [250, '50000.00'], [100000, '50000.00'],
        ];
    }

    public function test_auto_complete_counts_only_business_days_and_skips_the_weekend(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->for($user)->for(Address::factory()->for($user), 'address')->create(['status' => 'menunggu_konfirmasi']);
        // Delivered Friday 2026-10-16 10:00 -> 3 business days later is Wednesday 2026-10-21 10:00.
        Shipment::factory()->for($order)->create(['status' => 'delivered', 'delivered_at' => '2026-10-16 10:00:00']);

        $this->travelTo(\Illuminate\Support\Carbon::parse('2026-10-18 12:00:00')); // Sunday
        $this->artisan('orders:auto-complete-deliveries')->assertExitCode(0);
        $this->assertSame('menunggu_konfirmasi', $order->fresh()->status);

        $this->travelTo(\Illuminate\Support\Carbon::parse('2026-10-20 23:59:00')); // Tuesday night: only 2 business days
        $this->artisan('orders:auto-complete-deliveries')->assertExitCode(0);
        $this->assertSame('menunggu_konfirmasi', $order->fresh()->status);

        $this->travelTo(\Illuminate\Support\Carbon::parse('2026-10-21 10:00:00')); // Wednesday
        $this->artisan('orders:auto-complete-deliveries')->assertExitCode(0);
        $this->assertSame('selesai', $order->fresh()->status);
    }

    public function test_creator_without_complete_kyc_cannot_be_approved(): void
    {
        $admin = User::factory()->admin()->create();
        $profile = CreatorProfile::factory()->menungguApproval()->create([
            'kyc_full_name' => null, 'ktp_photo_path' => null, 'birth_date' => null, 'payout_account_number' => null,
        ]);

        $this->actingAs($admin)->postJson("/api/admin/creators/{$profile->id}/approve")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('kyc');

        $this->assertSame('menunggu_approval', $profile->fresh()->status);
    }

    public function test_notification_text_follows_the_reader_language(): void
    {
        $user = User::factory()->create();
        Notification::factory()->for($user)->create([
            'type' => 'order.paid', 'title' => 'Pembayaran berhasil',
            'body' => 'Pesanan HC-1 telah dibayar dan menunggu approval Admin.', 'params' => ['order' => 'HC-1'],
        ]);
        Notification::factory()->for($user)->create([
            'type' => 'order.paid', 'title' => 'Judul lama', 'body' => 'Isi lama tanpa params', 'params' => null,
        ]);

        $en = $this->actingAs($user)->getJson('/api/notifications?lang=en')->assertOk()->json('data');
        $id = $this->actingAs($user)->getJson('/api/notifications?lang=id')->assertOk()->json('data');

        $byBody = fn (array $rows, string $needle) => collect($rows)->first(fn ($r) => str_contains($r['body'], $needle));
        $this->assertSame('Payment successful', $byBody($en, 'HC-1')['title']);
        $this->assertSame('Order HC-1 has been paid and is waiting for Admin approval.', $byBody($en, 'HC-1')['body']);
        $this->assertSame('Pesanan HC-1 telah dibayar dan menunggu approval Admin.', $byBody($id, 'HC-1')['body']);
        $this->assertSame('Isi lama tanpa params', $byBody($en, 'Isi lama')['body']); // legacy rows keep stored text
    }

    public function test_biteship_failure_returns_a_clear_error_and_creates_no_shipment(): void
    {
        config(['services.biteship.api_key' => 'test-key']);
        Http::fake(['api.biteship.com/*' => Http::sequence()->pushStatus(401)->push(['id' => 'bs-9', 'courier' => ['waybill_id' => 'WB9']], 200)]);
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->diprosesProduksi()->create();

        $this->actingAs($admin)->postJson("/api/admin/orders/{$order->id}/shipment", ['courier_company' => 'jne', 'courier_type' => 'reg'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('courier');

        $this->assertSame(0, Shipment::where('order_id', $order->id)->count());
        $this->assertSame('diproses_produksi', $order->fresh()->status);

        // The admin retries once the courier API works again (second queued response).
        $this->actingAs($admin)->postJson("/api/admin/orders/{$order->id}/shipment", ['courier_company' => 'jne', 'courier_type' => 'reg'])->assertCreated();
    }

    public function test_courier_override_books_the_other_courier(): void
    {
        config(['services.biteship.api_key' => 'test-key']);
        Http::fake(['api.biteship.com/*' => Http::response(['id' => 'bs-10', 'courier' => ['waybill_id' => 'WB10']], 200)]);
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->diprosesProduksi()->create(['courier_company' => 'jne', 'courier_type' => 'reg']);

        $this->actingAs($admin)->postJson("/api/admin/orders/{$order->id}/shipment", ['courier_company' => 'sicepat', 'courier_type' => 'reg'])
            ->assertCreated()->assertJsonPath('data.courier', 'sicepat')->assertJsonPath('data.courier_type', 'reg');

        Http::assertSent(fn ($r) => str_contains($r->url(), 'api.biteship.com/v1/orders')
            && $r['courier_company'] === 'sicepat' && $r['courier_type'] === 'reg');
        $this->assertSame('bs-10', Shipment::where('order_id', $order->id)->first()->biteship_order_id);
    }

    public function test_private_channels_are_authorized_only_for_their_participants(): void
    {
        config([
            'broadcasting.default' => 'pusher',
            'broadcasting.connections.pusher.key' => 'test-key',
            'broadcasting.connections.pusher.secret' => 'test-secret',
            'broadcasting.connections.pusher.app_id' => '1',
        ]);
        // Channels were registered on the default driver at boot; register them on the pusher driver set above.
        require base_path('routes/channels.php');
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $thread = \App\Models\ChatThread::factory()->create(['customer_id' => $owner->id]);
        $auth = fn (User $u, string $channel) => $this->actingAs($u)->post('/broadcasting/auth', ['channel_name' => $channel, 'socket_id' => '1234.5678'], ['Accept' => 'application/json']);

        $status = fn (User $u, string $channel) => $auth($u, $channel)->getStatusCode();

        $this->assertSame(
            ['owner chat' => 200, 'other chat' => 403, 'admin chat' => 200, 'admin channel' => 200, 'owner admin channel' => 403, 'own user channel' => 200, 'other user channel' => 403],
            [
                'owner chat' => $status($owner, "private-chat.{$thread->id}"),
                'other chat' => $status($other, "private-chat.{$thread->id}"),
                'admin chat' => $status($admin, "private-chat.{$thread->id}"),
                'admin channel' => $status($admin, 'private-admin.chat'),
                'owner admin channel' => $status($owner, 'private-admin.chat'),
                'own user channel' => $status($owner, "private-App.Models.User.{$owner->id}"),
                'other user channel' => $status($other, "private-App.Models.User.{$owner->id}"),
            ],
        );
    }

    public function test_auth_emails_follow_the_request_language(): void
    {
        $user = User::factory()->create();
        app()->setLocale('en');
        $reset = (new ResetPasswordNotification('tok'))->toMail($user);
        $verify = (new \Illuminate\Auth\Notifications\VerifyEmail)->toMail($user);
        $this->assertSame(__('messages.auth.mail.reset_subject', [], 'en'), $reset->subject);
        $this->assertSame(__('messages.auth.mail.verify_subject', [], 'en'), $verify->subject);
        $this->assertNotSame(__('messages.auth.mail.reset_subject', [], 'id'), $reset->subject);

        app()->setLocale('id');
        $this->assertSame(__('messages.auth.mail.reset_subject', [], 'id'), (new ResetPasswordNotification('tok'))->toMail($user)->subject);
    }
}
