<?php

namespace Tests\Feature;

use App\Enums\UserStatus;
use App\Models\Commission;
use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** Admin creator approval queue — BR-001/008/019/020/023. */
class AdminCreatorTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_access_creator_queue(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/creators/pending')->assertForbidden();
    }

    public function test_admin_sees_only_pending_creators(): void
    {
        $admin = User::factory()->admin()->create();
        CreatorProfile::factory()->menungguApproval()->create();
        CreatorProfile::factory()->aktif()->create();

        $response = $this->actingAs($admin)->getJson('/api/admin/creators/pending');

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_admin_can_approve_pending_creator(): void
    {
        $admin = User::factory()->admin()->create();
        $profile = CreatorProfile::factory()->menungguApproval()->create();

        $response = $this->actingAs($admin)->postJson("/api/admin/creators/{$profile->id}/approve");

        $response->assertOk()->assertJsonPath('data.status', 'aktif');
        $this->assertSame('aktif', $profile->fresh()->status);
        $this->assertNotNull($profile->fresh()->approved_at);
    }

    public function test_cannot_approve_a_creator_that_is_not_pending(): void
    {
        $admin = User::factory()->admin()->create();
        $profile = CreatorProfile::factory()->aktif()->create();

        $this->actingAs($admin)->postJson("/api/admin/creators/{$profile->id}/approve")
            ->assertUnprocessable();
    }

    public function test_admin_can_reject_pending_creator_with_reason(): void
    {
        $admin = User::factory()->admin()->create();
        $profile = CreatorProfile::factory()->menungguApproval()->create();

        $response = $this->actingAs($admin)->postJson("/api/admin/creators/{$profile->id}/reject", [
            'reason' => 'Dokumen KYC tidak valid.',
        ]);

        $response->assertOk()->assertJsonPath('data.status', 'ditolak');
    }

    public function test_reject_requires_a_reason_of_at_least_10_characters(): void
    {
        $admin = User::factory()->admin()->create();
        $profile = CreatorProfile::factory()->menungguApproval()->create();

        $this->actingAs($admin)->postJson("/api/admin/creators/{$profile->id}/reject", ['reason' => 'pendek'])
            ->assertUnprocessable();
    }

    /** BR-019: plain ban hides designs but does not touch the Customer account or commissions. */
    public function test_plain_ban_does_not_suspend_account_or_hold_commissions(): void
    {
        $admin = User::factory()->admin()->create();
        $profile = CreatorProfile::factory()->aktif()->create();
        $commission = Commission::factory()->for($profile->user, 'creator')->create(['status' => 'terhutang']);

        $response = $this->actingAs($admin)->postJson("/api/admin/creators/{$profile->id}/ban", [
            'reason' => 'Melanggar ketentuan konten.',
        ]);

        $response->assertOk()->assertJsonPath('data.status', 'banned');
        $this->assertSame(UserStatus::Aktif, $profile->user->fresh()->status);
        $this->assertSame('terhutang', $commission->fresh()->status);
    }

    public function test_admin_can_view_the_ktp_photo_for_a_pending_creator(): void
    {
        Storage::fake('local');
        $admin = User::factory()->admin()->create();
        $profile = CreatorProfile::factory()->menungguApproval()->create();
        $path = UploadedFile::fake()->image('ktp.jpg')->store('kyc-uploads', 'local');
        $profile->update(['ktp_photo_path' => $path]);

        $this->actingAs($admin)->get("/api/admin/creators/{$profile->id}/kyc-document")
            ->assertOk();
    }

    public function test_customer_cannot_view_a_creators_ktp_photo(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();
        $profile = CreatorProfile::factory()->menungguApproval()->create();
        $path = UploadedFile::fake()->image('ktp.jpg')->store('kyc-uploads', 'local');
        $profile->update(['ktp_photo_path' => $path]);

        $this->actingAs($user)->get("/api/admin/creators/{$profile->id}/kyc-document")
            ->assertForbidden();
    }

    /** BR-020: copyright-violation ban suspends the account and holds outstanding commissions. */
    public function test_copyright_violation_ban_suspends_account_and_holds_commissions(): void
    {
        $admin = User::factory()->admin()->create();
        $profile = CreatorProfile::factory()->aktif()->create();
        $commission = Commission::factory()->for($profile->user, 'creator')->create(['status' => 'terhutang']);

        $response = $this->actingAs($admin)->postJson("/api/admin/creators/{$profile->id}/ban", [
            'reason' => 'Terbukti melanggar hak cipta desain lain.',
            'copyright_violation' => true,
        ]);

        $response->assertOk()->assertJsonPath('data.status', 'banned');
        $this->assertSame(UserStatus::Banned, $profile->user->fresh()->status);
        $this->assertSame('ditahan', $commission->fresh()->status);
    }

    public function test_admin_can_list_active_creators_and_banned_ones_separately(): void
    {
        $admin = User::factory()->admin()->create();
        $active = CreatorProfile::factory()->aktif()->create();
        CreatorProfile::factory()->menungguApproval()->create();

        $this->actingAs($admin)->getJson('/api/admin/creators')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $active->id);

        $active->update(['status' => 'banned']);

        $this->actingAs($admin)->getJson('/api/admin/creators?status=banned')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_customer_cannot_list_creators(): void
    {
        $this->actingAs(User::factory()->create())->getJson('/api/admin/creators')->assertForbidden();
    }
}
