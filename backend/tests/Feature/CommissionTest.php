<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Commission;
use App\Models\CreatorProfile;
use App\Models\Design;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/** BR-007 — commission auto-generated per paid transaction involving a Creator's design. */
class CommissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.midtrans.server_key' => 'test-server-key']);
    }

    private function signedPayload(string $orderNumber, string $grossAmount): array
    {
        $payload = [
            'order_id' => $orderNumber,
            'status_code' => '200',
            'gross_amount' => $grossAmount,
        ];
        $payload['signature_key'] = hash(
            'sha512',
            $payload['order_id'].$payload['status_code'].$payload['gross_amount'].'test-server-key'
        );

        return $payload;
    }

    private function fakeMidtransStatus(string $orderNumber, string $grossAmount): void
    {
        Http::fake([
            'api.sandbox.midtrans.com/v2/*/status' => Http::response([
                'order_id' => $orderNumber,
                'status_code' => '200',
                'gross_amount' => $grossAmount,
                'transaction_status' => 'settlement',
                'fraud_status' => 'accept',
            ], 200),
        ]);
    }

    public function test_settlement_generates_commission_for_design_linked_item(): void
    {
        $creator = CreatorProfile::factory()->aktif()->create()->user;
        $design = Design::factory()->for($creator, 'creator')->create();
        $customer = User::factory()->create();
        $address = Address::factory()->for($customer)->create();
        $order = Order::factory()->for($customer)->for($address, 'address')
            ->create(['order_number' => 'HC-COMM-0001', 'total' => 100000]);
        Payment::factory()->for($order)->create(['amount' => 100000]);
        $item = OrderItem::factory()->for($order)->create([
            'design_id' => $design->id,
            'subtotal' => 100000,
        ]);

        $this->fakeMidtransStatus('HC-COMM-0001', '100000.00');

        $this->postJson('/api/webhooks/midtrans', $this->signedPayload('HC-COMM-0001', '100000.00'))
            ->assertOk();

        $this->assertDatabaseHas('commissions', [
            'creator_id' => $creator->id,
            'order_item_id' => $item->id,
            'amount' => '20000.00', // 20% placeholder rate of 100000
            'status' => 'terhutang',
        ]);
    }

    public function test_settlement_does_not_generate_commission_for_custom_upload_item(): void
    {
        $customer = User::factory()->create();
        $address = Address::factory()->for($customer)->create();
        $order = Order::factory()->for($customer)->for($address, 'address')
            ->create(['order_number' => 'HC-COMM-0002', 'total' => 50000]);
        Payment::factory()->for($order)->create(['amount' => 50000]);
        OrderItem::factory()->for($order)->create(['design_id' => null, 'subtotal' => 50000]);

        $this->fakeMidtransStatus('HC-COMM-0002', '50000.00');

        $this->postJson('/api/webhooks/midtrans', $this->signedPayload('HC-COMM-0002', '50000.00'))
            ->assertOk();

        $this->assertDatabaseCount('commissions', 0);
    }

    public function test_creator_can_view_own_earnings_and_summary(): void
    {
        $creator = CreatorProfile::factory()->aktif()->create()->user;
        Commission::factory()->for($creator, 'creator')->create(['amount' => 10000, 'status' => 'terhutang']);
        Commission::factory()->for($creator, 'creator')->create(['amount' => 5000, 'status' => 'dibayar']);
        Commission::factory()->create(); // another creator's, shouldn't show

        $response = $this->actingAs($creator)->getJson('/api/creator/earnings');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('summary.total', '15000.00')
            ->assertJsonPath('summary.terhutang', '10000.00')
            ->assertJsonPath('summary.dibayar', '5000.00');
    }
}
