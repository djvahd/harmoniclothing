<?php

namespace Tests\Feature;

use App\Models\Design;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Admin design approval queue — FR-025, BR-002/028. */
class AdminDesignTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_access_design_queue(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/designs/pending')->assertForbidden();
    }

    public function test_admin_sees_only_pending_designs(): void
    {
        $admin = User::factory()->admin()->create();
        Design::factory()->pendingApproval()->create();
        Design::factory()->create(['status' => 'aktif']);

        $response = $this->actingAs($admin)->getJson('/api/admin/designs/pending');

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_admin_can_approve_a_pending_design(): void
    {
        $admin = User::factory()->admin()->create();
        $design = Design::factory()->pendingApproval()->create();

        $response = $this->actingAs($admin)->postJson("/api/admin/designs/{$design->id}/approve");

        $response->assertOk()->assertJsonPath('data.status', 'aktif');
        $this->assertNotNull($design->fresh()->approved_at);
    }

    public function test_cannot_approve_a_design_that_is_not_pending(): void
    {
        $admin = User::factory()->admin()->create();
        $design = Design::factory()->create(['status' => 'draft']);

        $this->actingAs($admin)->postJson("/api/admin/designs/{$design->id}/approve")
            ->assertUnprocessable();
    }

    public function test_admin_can_reject_a_pending_design_with_reason(): void
    {
        $admin = User::factory()->admin()->create();
        $design = Design::factory()->pendingApproval()->create();

        $response = $this->actingAs($admin)->postJson("/api/admin/designs/{$design->id}/reject", [
            'reason' => 'Melanggar hak cipta karakter lisensi.',
        ]);

        $response->assertOk()->assertJsonPath('data.status', 'ditolak');
    }

    public function test_reject_requires_a_reason_of_at_least_10_characters(): void
    {
        $admin = User::factory()->admin()->create();
        $design = Design::factory()->pendingApproval()->create();

        $this->actingAs($admin)->postJson("/api/admin/designs/{$design->id}/reject", ['reason' => 'no'])
            ->assertUnprocessable();
    }
}
