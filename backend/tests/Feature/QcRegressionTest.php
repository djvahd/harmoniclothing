<?php

namespace Tests\Feature;

use App\Enums\UserStatus;
use App\Models\Address;
use App\Models\CartItem;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
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
