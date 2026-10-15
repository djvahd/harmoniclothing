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
use App\Models\Design;
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
}
