<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
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

    public function test_top_products_only_count_sold_orders(): void
    {
        $admin = User::factory()->admin()->create();
        $sold = OrderItem::factory()->for(Order::factory()->state(['status' => 'selesai']))->create(['quantity' => 2]);
        foreach (['belum_dibayar', 'dibatalkan', 'ditolak'] as $status) {
            OrderItem::factory()->for(Order::factory()->state(['status' => $status]))->create(['quantity' => 9]);
        }

        $response = $this->actingAs($admin)->getJson('/api/admin/reports/sales');

        $response->assertOk()->assertJsonCount(1, 'data.top_products')
            ->assertJsonPath('data.top_products.0.quantity_sold', 2);
    }

    public function test_invalid_report_dates_return_422(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->getJson('/api/admin/reports/sales?from=abc')
            ->assertUnprocessable()->assertJsonValidationErrors('from');
        $this->actingAs($admin)->getJson('/api/admin/reports/sales?from=2026-10-30&to=2026-10-01')
            ->assertUnprocessable()->assertJsonValidationErrors('to');
    }

    public function test_invalid_per_page_returns_422_on_admin_lists(): void
    {
        $admin = User::factory()->admin()->create();

        foreach (['orders', 'users', 'payments', 'audit-logs', 'catalog/products'] as $path) {
            $this->actingAs($admin)->getJson("/api/admin/{$path}?per_page=-1")
                ->assertUnprocessable()->assertJsonValidationErrors('per_page');
        }
    }
}
