<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** GET /admin/reports/sales — FR-033. */
class AdminReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_access_sales_report(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/reports/sales')->assertForbidden();
    }

    public function test_admin_sees_revenue_and_order_totals(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create();
        Payment::factory()->for($order)->berhasil()->create(['amount' => 200000]);

        $response = $this->actingAs($admin)->getJson('/api/admin/reports/sales');

        $response->assertOk()
            ->assertJsonPath('data.revenue.total', '200000.00')
            ->assertJsonPath('data.revenue.average_order_value', '200000.00');
    }

    public function test_payments_outside_the_date_range_are_excluded(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create();
        Payment::factory()->for($order)->berhasil()->create(['amount' => 200000, 'paid_at' => now()->subDays(60)]);

        $response = $this->actingAs($admin)->getJson('/api/admin/reports/sales?from='.now()->subDays(7)->toDateString().'&to='.now()->toDateString());

        $response->assertOk()->assertJsonPath('data.revenue.total', '0.00');
    }
}
