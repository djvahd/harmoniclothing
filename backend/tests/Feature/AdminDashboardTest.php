<?php

namespace Tests\Feature;

use App\Models\CreatorProfile;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** GET /admin/dashboard — FE-042. */
class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_dashboard(): void
    {
        $this->getJson('/api/admin/dashboard')->assertUnauthorized();
    }

    public function test_customer_cannot_access_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/dashboard')->assertForbidden();
    }

    public function test_admin_sees_summary_counts(): void
    {
        $admin = User::factory()->admin()->create();
        CreatorProfile::factory()->aktif()->create();
        CreatorProfile::factory()->menungguApproval()->create();
        $order = Order::factory()->menungguApproval()->create();
        Payment::factory()->for($order)->berhasil()->create(['amount' => 150000]);

        $response = $this->actingAs($admin)->getJson('/api/admin/dashboard');

        $response->assertOk()
            ->assertJsonPath('data.users.creators_active', 1)
            ->assertJsonPath('data.users.creators_pending', 1)
            ->assertJsonPath('data.orders.menunggu_approval', 1)
            ->assertJsonPath('data.revenue.total', '150000.00');
    }
}
