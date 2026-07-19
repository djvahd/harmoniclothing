<?php

namespace Tests\Feature;

use App\Models\CreatorProfile;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Admin audit logs — 2.5_Permission_Matrix.md §10. */
class AdminAuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_access_audit_logs(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/audit-logs')->assertForbidden();
    }

    public function test_approving_a_creator_writes_an_audit_log(): void
    {
        $admin = User::factory()->admin()->create();
        $profile = CreatorProfile::factory()->menungguApproval()->create();

        $this->actingAs($admin)->postJson("/api/admin/creators/{$profile->id}/approve");

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $admin->id,
            'action' => 'creator.approve',
            'entity_type' => CreatorProfile::class,
            'entity_id' => $profile->id,
        ]);
    }

    public function test_rejecting_an_order_writes_an_audit_log_with_the_reason(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->menungguApproval()->create();

        $this->actingAs($admin)->postJson("/api/admin/orders/{$order->id}/reject", [
            'reason' => 'Bahan yang diminta sedang habis.',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $admin->id,
            'action' => 'order.reject',
            'entity_type' => Order::class,
            'entity_id' => $order->id,
            'description' => 'Bahan yang diminta sedang habis.',
        ]);
    }

    public function test_admin_can_list_and_filter_audit_logs(): void
    {
        $admin = User::factory()->admin()->create();
        $profile = CreatorProfile::factory()->menungguApproval()->create();
        $this->actingAs($admin)->postJson("/api/admin/creators/{$profile->id}/approve");

        $response = $this->actingAs($admin)->getJson('/api/admin/audit-logs?action=creator.approve');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.actor.id', $admin->id);
    }
}
