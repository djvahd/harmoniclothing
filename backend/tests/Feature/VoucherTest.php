<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\AuditLog;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/** #98 — admin-managed vouchers applied at regular checkout. Shipping is faked at Rp 18.000, one item at Rp 100.000. */
class VoucherTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Address $address;

    private CartItem $cartItem;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.biteship.api_key' => 'test-key']);
        Http::fake(['api.biteship.com/v1/rates/couriers' => Http::response([
            'success' => true,
            'pricing' => [[
                'courier_code' => 'jne', 'courier_name' => 'JNE',
                'courier_service_code' => 'reg', 'courier_service_name' => 'Reguler',
                'price' => 18000, 'duration' => '1 - 2 days',
            ]],
        ])]);

        $this->user = User::factory()->create();
        $this->address = Address::factory()->for($this->user)->create();
        $this->cartItem = $this->newCartItem($this->user, 100000);
    }

    private function newCartItem(User $user, int $price): CartItem
    {
        return CartItem::factory()->for($user)->for(ProductVariant::factory()->create(), 'productVariant')->create([
            'quantity' => 1,
            'unit_price_snapshot' => $price,
        ]);
    }

    private function checkout(?string $code, ?CartItem $item = null, ?User $user = null): TestResponse
    {
        $user ??= $this->user;
        $item ??= $this->cartItem;

        return $this->actingAs($user)->postJson('/api/checkout', array_filter([
            'address_id' => Address::query()->where('user_id', $user->id)->value('id'),
            'cart_item_ids' => [$item->id],
            'courier_company' => 'jne',
            'courier_type' => 'reg',
            'voucher_code' => $code,
        ]));
    }

    // ---- admin management ----

    public function test_only_an_admin_can_manage_vouchers(): void
    {
        $this->actingAs($this->user)->getJson('/api/admin/vouchers')->assertForbidden();
        $this->actingAs($this->user)->postJson('/api/admin/vouchers', [])->assertForbidden();
    }

    public function test_admin_creates_a_voucher_and_the_code_is_normalised_and_audited(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->postJson('/api/admin/vouchers', [
            'code' => ' hemat10 ',
            'type' => 'percent',
            'value' => 10,
            'max_discount' => 25000,
            'min_subtotal' => 50000,
            'quota' => 5,
        ])->assertCreated()
            ->assertJsonPath('data.code', 'HEMAT10')
            ->assertJsonPath('data.redeemed', 0)
            ->assertJsonPath('data.is_active', true);

        $this->assertTrue(AuditLog::query()->where('action', 'voucher.create')->exists());
    }

    public function test_voucher_validation_rejects_bad_input(): void
    {
        $admin = User::factory()->admin()->create();
        Voucher::factory()->create(['code' => 'TAKEN']);

        $this->actingAs($admin)->postJson('/api/admin/vouchers', ['code' => 'TAKEN', 'type' => 'nominal', 'value' => 5000])
            ->assertJsonValidationErrors('code');
        $this->actingAs($admin)->postJson('/api/admin/vouchers', ['code' => 'OVER', 'type' => 'percent', 'value' => 150])
            ->assertJsonValidationErrors('value');
        $this->actingAs($admin)->postJson('/api/admin/vouchers', ['code' => 'NOVALUE', 'type' => 'nominal'])
            ->assertJsonValidationErrors('value');
        $this->actingAs($admin)->postJson('/api/admin/vouchers', ['code' => 'BADTYPE', 'type' => 'bogus', 'value' => 1])
            ->assertJsonValidationErrors('type');
        $this->actingAs($admin)->postJson('/api/admin/vouchers', [
            'code' => 'BADDATES', 'type' => 'nominal', 'value' => 1, 'starts_at' => '2026-12-01', 'expires_at' => '2026-11-01',
        ])->assertJsonValidationErrors('expires_at');
    }

    public function test_free_shipping_voucher_needs_no_value_and_admin_can_deactivate(): void
    {
        $admin = User::factory()->admin()->create();

        $id = $this->actingAs($admin)->postJson('/api/admin/vouchers', ['code' => 'ONGKIR', 'type' => 'free_shipping'])
            ->assertCreated()
            ->assertJsonPath('data.value', '0.00')
            ->json('data.id');

        $this->actingAs($admin)->patchJson("/api/admin/vouchers/{$id}", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);
        $this->assertTrue(AuditLog::query()->where('action', 'voucher.update')->exists());
    }

    // ---- checkout ----

    public function test_nominal_voucher_reduces_the_total_and_is_recorded_on_the_order(): void
    {
        $voucher = Voucher::factory()->create(['code' => 'HEMAT10K', 'value' => 10000]);

        $this->checkout('hemat10k')->assertCreated()
            ->assertJsonPath('data.discount_amount', '10000.00')
            ->assertJsonPath('data.voucher_code', 'HEMAT10K')
            ->assertJsonPath('data.total', '108000.00');

        $this->assertDatabaseHas('orders', ['user_id' => $this->user->id, 'voucher_id' => $voucher->id, 'discount_amount' => 10000]);
        $this->assertDatabaseMissing('cart_items', ['id' => $this->cartItem->id]);
    }

    public function test_percent_voucher_is_truncated_and_capped(): void
    {
        Voucher::factory()->percent(15, 12000)->create(['code' => 'CAPPED']);

        // 15% of 100.000 = 15.000, capped at 12.000.
        $this->checkout('CAPPED')->assertCreated()->assertJsonPath('data.discount_amount', '12000.00');

        $other = User::factory()->create();
        Address::factory()->for($other)->create();
        Voucher::factory()->percent(7)->create(['code' => 'SEVEN']);
        $item = $this->newCartItem($other, 12345);

        // 7% of 12.345 = 864,15 -> 864 (never rounded up).
        $this->checkout('SEVEN', $item, $other)->assertCreated()->assertJsonPath('data.discount_amount', '864.00');
    }

    public function test_free_shipping_voucher_takes_the_shipping_cost_off(): void
    {
        Voucher::factory()->freeShipping()->create(['code' => 'ONGKIR']);

        $this->checkout('ONGKIR')->assertCreated()
            ->assertJsonPath('data.discount_amount', '18000.00')
            ->assertJsonPath('data.total', '100000.00');
    }

    public function test_discount_never_takes_the_order_below_the_minimum_payable(): void
    {
        Voucher::factory()->create(['code' => 'HUGE', 'value' => 500000]);

        // subtotal 100.000 + shipping 18.000 - discount, but the remainder stays at business.voucher_min_payable (1.000).
        $this->checkout('HUGE')->assertCreated()
            ->assertJsonPath('data.discount_amount', '117000.00')
            ->assertJsonPath('data.total', '1000.00');
    }

    /** @return array<string, array{0: array<string, mixed>, 1: string, 2: string}> voucher state, submitted code, expected message key */
    public static function rejectedVouchers(): array
    {
        return [
            'unknown code' => [['code' => 'EXISTING'], 'NOPE', 'invalid'],
            'inactive' => [['is_active' => false], 'TESTCODE', 'invalid'],
            'not started' => [['starts_at' => '2999-01-01'], 'TESTCODE', 'not_started'],
            'expired' => [['expires_at' => '2000-01-01'], 'TESTCODE', 'expired'],
            'below minimum spend' => [['min_subtotal' => 200000], 'TESTCODE', 'min_subtotal'],
        ];
    }

    /** @param  array<string, mixed>  $overrides */
    #[DataProvider('rejectedVouchers')]
    public function test_checkout_rejects_an_unusable_voucher_without_creating_an_order(array $overrides, string $submitted, string $reason): void
    {
        Voucher::factory()->create(['code' => 'TESTCODE', ...$overrides]);

        $response = $this->checkout($submitted)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('voucher_code');

        $this->assertSame(__("messages.voucher.{$reason}", ['amount' => '200.000']), $response->json('errors.voucher_code.0'));
        $this->assertSame(0, Order::query()->count());
        $this->assertDatabaseHas('cart_items', ['id' => $this->cartItem->id]);
    }

    public function test_quota_is_enforced_and_a_cancelled_order_gives_it_back(): void
    {
        $voucher = Voucher::factory()->create(['code' => 'ONCE', 'quota' => 1]);

        $this->checkout('ONCE')->assertCreated();

        $other = User::factory()->create();
        Address::factory()->for($other)->create();
        $this->checkout('ONCE', $this->newCartItem($other, 100000), $other)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('voucher_code');

        Order::query()->where('voucher_id', $voucher->id)->update(['status' => 'dibatalkan']);

        $this->checkout('ONCE', $this->newCartItem($other, 100000), $other)->assertCreated();
    }

    public function test_a_customer_can_use_a_voucher_only_once_unless_the_order_was_cancelled(): void
    {
        Voucher::factory()->create(['code' => 'SINGLE']);

        $this->checkout('SINGLE')->assertCreated();
        $this->checkout('SINGLE', $this->newCartItem($this->user, 100000))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('voucher_code');

        Order::query()->where('user_id', $this->user->id)->update(['status' => 'dibatalkan']);

        $this->checkout('SINGLE', $this->newCartItem($this->user, 100000))->assertCreated();
    }

    public function test_checkout_without_a_voucher_is_unchanged(): void
    {
        $this->checkout(null)->assertCreated()
            ->assertJsonPath('data.discount_amount', '0.00')
            ->assertJsonPath('data.total', '118000.00')
            ->assertJsonPath('data.voucher_code', null);
    }

    // ---- preview ----

    public function test_preview_reports_the_discount_without_creating_anything(): void
    {
        Voucher::factory()->freeShipping(10000)->create(['code' => 'ONGKIR10']);

        $this->actingAs($this->user)->postJson('/api/checkout/voucher/preview', [
            'code' => 'ongkir10',
            'cart_item_ids' => [$this->cartItem->id],
            'shipping_cost' => 18000,
        ])->assertOk()
            ->assertJsonPath('data.code', 'ONGKIR10')
            ->assertJsonPath('data.type', 'free_shipping')
            ->assertJsonPath('data.discount', '10000');

        $this->assertSame(0, Order::query()->count());
        $this->assertDatabaseHas('cart_items', ['id' => $this->cartItem->id]);
    }

    public function test_preview_rejects_a_bad_code_with_the_same_message_as_checkout(): void
    {
        $this->actingAs($this->user)->postJson('/api/checkout/voucher/preview', [
            'code' => 'MISSING',
            'cart_item_ids' => [$this->cartItem->id],
        ])->assertUnprocessable()->assertJsonValidationErrors('voucher_code');
    }

    public function test_preview_ignores_another_customers_cart_items(): void
    {
        $other = User::factory()->create();
        $theirs = $this->newCartItem($other, 100000);
        Voucher::factory()->create(['code' => 'ANY']);

        $this->actingAs($this->user)->postJson('/api/checkout/voucher/preview', [
            'code' => 'ANY',
            'cart_item_ids' => [$theirs->id],
        ])->assertUnprocessable()->assertJsonValidationErrors('cart_item_ids.0');
    }

    // ---- payment ----

    public function test_snap_gets_a_negative_discount_line_that_keeps_items_summing_to_gross_amount(): void
    {
        config(['services.midtrans.server_key' => 'test-server-key']);
        Http::fake(['*midtrans.com/*' => Http::response(['redirect_url' => 'https://pay.test/snap'], 201)]);
        Voucher::factory()->create(['code' => 'SNAP5K', 'value' => 5000]);

        $this->checkout('SNAP5K')->assertCreated()->assertJsonPath('data.midtrans_redirect_url', 'https://pay.test/snap');

        Http::assertSent(function ($request) {
            if (! str_contains($request->url(), 'midtrans.com')) {
                return false;
            }
            $data = $request->data();
            $sum = array_sum(array_map(fn ($i) => $i['price'] * $i['quantity'], $data['item_details']));

            return $data['transaction_details']['gross_amount'] === 113000
                && $sum === 113000
                && collect($data['item_details'])->contains(fn ($i) => $i['id'] === 'discount' && $i['price'] === -5000);
        });
    }
}
