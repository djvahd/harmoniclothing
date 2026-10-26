<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CreatorProfile;
use App\Models\Design;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

/** FR-041/035, BR-008/013 — become-creator + KYC verification (expanded 2026-07-22). */
class CreatorTest extends TestCase
{
    use RefreshDatabase;

    /** Minimal valid /creator/verification payload for an adult applicant. */
    private function adultVerificationPayload(array $overrides = []): array
    {
        return array_merge([
            'kyc_full_name' => 'Budi Santoso',
            'kyc_id_number' => '1234567890123456',
            'birth_date' => now()->subYears(25)->format('Y-m-d'),
            'address' => 'Jl. Merdeka No. 1, Jakarta',
            'ktp_photo' => UploadedFile::fake()->image('ktp.jpg'),
            'payout_method' => 'bank_transfer',
            'payout_account_number' => '1234567890',
            'payout_account_holder' => 'Budi Santoso',
        ], $overrides);
    }

    public function test_guest_cannot_become_creator(): void
    {
        $this->postJson('/api/account/become-creator')->assertUnauthorized();
    }

    public function test_user_can_become_a_creator_applicant(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/account/become-creator', [
            'terms_accepted' => true,
        ]);

        $response->assertCreated()->assertJsonPath('data.status', null);
        $this->assertNotNull($user->fresh()->creatorProfile);
    }

    public function test_becoming_creator_requires_accepting_terms(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/account/become-creator', [])
            ->assertUnprocessable();
    }

    /** brand_name/bio/portfolio_url (2026-07-22): public-facing, saved on application. */
    public function test_becoming_creator_saves_brand_name_bio_and_portfolio(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/account/become-creator', [
            'terms_accepted' => true,
            'brand_name' => 'Studio Rangga',
            'bio' => 'Desainer streetwear asal Bandung.',
            'portfolio_url' => 'https://instagram.com/studiorangga',
        ])->assertCreated();

        $profile = $user->fresh()->creatorProfile;
        $this->assertSame('Studio Rangga', $profile->brand_name);
        $this->assertSame('Desainer streetwear asal Bandung.', $profile->bio);
        $this->assertNotNull($profile->terms_accepted_at);
    }

    public function test_user_cannot_become_creator_twice(): void
    {
        $user = User::factory()->create();
        CreatorProfile::factory()->for($user)->create();

        $this->actingAs($user)->postJson('/api/account/become-creator', ['terms_accepted' => true])
            ->assertUnprocessable();
    }

    /** BR-008: KYC required before status can move to menunggu_approval. */
    public function test_verification_requires_an_existing_creator_application(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/creator/verification', $this->adultVerificationPayload())
            ->assertUnprocessable();
    }

    public function test_verification_moves_status_to_menunggu_approval(): void
    {
        $user = User::factory()->create();
        CreatorProfile::factory()->for($user)->create();

        $response = $this->actingAs($user)->postJson('/api/creator/verification', $this->adultVerificationPayload());

        $response->assertOk()->assertJsonPath('data.status', 'menunggu_approval');
        $this->assertNotNull($user->fresh()->creatorProfile->ktp_photo_path);
    }

    /** Guardian branch: under-18 applicants must also supply guardian data + consent. */
    public function test_verification_requires_guardian_fields_when_applicant_is_a_minor(): void
    {
        $user = User::factory()->create();
        CreatorProfile::factory()->for($user)->create();

        $this->actingAs($user)->postJson('/api/creator/verification', $this->adultVerificationPayload([
            'birth_date' => now()->subYears(16)->format('Y-m-d'),
        ]))->assertUnprocessable();
    }

    public function test_minor_can_verify_with_guardian_consent(): void
    {
        $user = User::factory()->create();
        CreatorProfile::factory()->for($user)->create();

        $response = $this->actingAs($user)->postJson('/api/creator/verification', $this->adultVerificationPayload([
            'birth_date' => now()->subYears(16)->format('Y-m-d'),
            'guardian_name' => 'Siti Aminah',
            'guardian_id_number' => '9876543210123456',
            'guardian_consent' => true,
        ]));

        $response->assertOk()->assertJsonPath('data.status', 'menunggu_approval');
        $profile = $user->fresh()->creatorProfile;
        $this->assertTrue($profile->isMinor());
        $this->assertSame('Siti Aminah', $profile->guardian_name);
        $this->assertNotNull($profile->guardian_consent_at);
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

    /** brand_name (2026-07-22) overrides the account name on the public profile when set. */
    public function test_public_creator_profile_prefers_brand_name_over_account_name(): void
    {
        $profile = CreatorProfile::factory()->aktif()->create(['brand_name' => 'Studio Rangga']);

        $this->getJson("/api/marketplace/creators/{$profile->slug}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Studio Rangga');
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

    public function test_verification_status_endpoint_reports_the_applicants_own_state(): void
    {
        $fresh = User::factory()->create();
        $this->actingAs($fresh)->getJson('/api/creator/verification')
            ->assertOk()->assertJsonPath('data.applied', false)->assertJsonPath('data.status', null);

        $rejected = CreatorProfile::factory()->create(['status' => 'ditolak', 'rejection_reason' => 'Foto KTP buram']);
        $this->actingAs($rejected->user)->getJson('/api/creator/verification')
            ->assertOk()->assertJsonPath('data.status', 'ditolak')->assertJsonPath('data.rejection_reason', 'Foto KTP buram');
    }

    public function test_pending_active_and_banned_applications_cannot_be_resubmitted_but_rejected_can(): void
    {
        foreach (['menunggu_approval', 'aktif', 'banned'] as $status) {
            $profile = CreatorProfile::factory()->create(['status' => $status]);
            $this->actingAs($profile->user)->postJson('/api/creator/verification', $this->adultVerificationPayload())
                ->assertUnprocessable()->assertJsonValidationErrors('status');
        }

        $rejected = CreatorProfile::factory()->create(['status' => 'ditolak', 'rejection_reason' => 'Foto KTP buram']);
        $this->actingAs($rejected->user)->postJson('/api/creator/verification', $this->adultVerificationPayload())->assertOk();
        $this->assertSame('menunggu_approval', $rejected->fresh()->status);
    }

    public function test_active_creator_can_read_profile_with_masked_payout_and_update_brand_fields(): void
    {
        $profile = CreatorProfile::factory()->aktif()->create(['payout_account_number' => '1234567890']);

        $this->actingAs($profile->user)->getJson("/api/creator/profile")
            ->assertOk()
            ->assertJsonPath('data.payout_account_masked', '••••••7890')
            ->assertJsonMissingPath('data.payout_account_number');

        $this->actingAs($profile->user)->patchJson('/api/creator/profile', [
            'brand_name' => 'Brand Baru',
            'bio' => 'Bio baru',
            'portfolio_url' => 'https://example.com/me',
            'payout_account_number' => '9999999999',
        ])->assertOk()->assertJsonPath('data.brand_name', 'Brand Baru');

        $fresh = $profile->fresh();
        $this->assertSame('Brand Baru', $fresh->brand_name);
        $this->assertSame('1234567890', $fresh->payout_account_number);
        $this->assertSame($profile->slug, $fresh->slug);
    }

    public function test_creator_profile_is_not_available_before_approval_and_validates_url(): void
    {
        $pending = CreatorProfile::factory()->create(['status' => 'menunggu_approval']);
        $this->actingAs($pending->user)->patchJson('/api/creator/profile', ['brand_name' => 'X'])->assertForbidden();

        $active = CreatorProfile::factory()->aktif()->create();
        $this->actingAs($active->user)->patchJson('/api/creator/profile', ['portfolio_url' => 'bukan-url'])
            ->assertUnprocessable()->assertJsonValidationErrors('portfolio_url');
    }
}
