<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CreatorProfile;
use App\Models\Design;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** FR-041/035, BR-008/013 — become-creator + KYC verification. */
class CreatorTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_become_creator(): void
    {
        $this->postJson('/api/account/become-creator')->assertUnauthorized();
    }

    public function test_user_can_become_a_creator_applicant(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/account/become-creator');

        $response->assertCreated()->assertJsonPath('data.status', null);
        $this->assertNotNull($user->fresh()->creatorProfile);
    }

    public function test_user_cannot_become_creator_twice(): void
    {
        $user = User::factory()->create();
        CreatorProfile::factory()->for($user)->create();

        $this->actingAs($user)->postJson('/api/account/become-creator')
            ->assertUnprocessable();
    }

    /** BR-008: KYC required before status can move to menunggu_approval. */
    public function test_verification_requires_an_existing_creator_application(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/creator/verification', [
            'kyc_full_name' => 'Budi Santoso',
            'kyc_id_number' => '1234567890123456',
        ])->assertUnprocessable();
    }

    public function test_verification_moves_status_to_menunggu_approval(): void
    {
        $user = User::factory()->create();
        CreatorProfile::factory()->for($user)->create();

        $response = $this->actingAs($user)->postJson('/api/creator/verification', [
            'kyc_full_name' => 'Budi Santoso',
            'kyc_id_number' => '1234567890123456',
        ]);

        $response->assertOk()->assertJsonPath('data.status', 'menunggu_approval');
    }

    /** Non-creator-scoped routes should reject a user without an active creator profile. */
    public function test_creator_only_route_rejects_non_active_creator(): void
    {
        $user = User::factory()->create();
        CreatorProfile::factory()->menungguApproval()->for($user)->create();

        $this->actingAs($user)->getJson('/api/creator/dashboard')->assertForbidden();
    }

    public function test_creator_dashboard_shows_own_design_counts(): void
    {
        $profile = CreatorProfile::factory()->aktif()->create();
        Design::factory()->for($profile->user, 'creator')->create(['status' => 'aktif']);
        Design::factory()->pendingApproval()->for($profile->user, 'creator')->create();

        $this->actingAs($profile->user)->getJson('/api/creator/dashboard')
            ->assertOk()
            ->assertJsonPath('data.total_designs', 2)
            ->assertJsonPath('data.active_designs', 1)
            ->assertJsonPath('data.pending_designs', 1);
    }

    public function test_public_creator_profile_shows_active_designs_only(): void
    {
        $profile = CreatorProfile::factory()->aktif()->create();
        $category = Category::factory()->design()->create();
        Design::factory()->for($profile->user, 'creator')->for($category)->create();
        Design::factory()->pendingApproval()->for($profile->user, 'creator')->create();

        $response = $this->getJson("/api/marketplace/creators/{$profile->slug}");

        $response->assertOk()
            ->assertJsonPath('data.name', $profile->user->name)
            ->assertJsonCount(1, 'data.designs');
    }

    public function test_public_creator_profile_404s_for_non_active_creator(): void
    {
        $profile = CreatorProfile::factory()->menungguApproval()->create();

        $this->getJson("/api/marketplace/creators/{$profile->slug}")->assertNotFound();
    }

    /** BR-019: banned creator's designs disappear from the marketplace. */
    public function test_banned_creators_designs_are_hidden_from_marketplace(): void
    {
        $profile = CreatorProfile::factory()->banned()->create();
        Design::factory()->for($profile->user, 'creator')->create();

        $this->getJson('/api/marketplace/designs')->assertJsonCount(0, 'data');
    }
}
