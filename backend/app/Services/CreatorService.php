<?php

namespace App\Services;

use App\Enums\UserStatus;
use App\Models\CreatorProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * FR-041 become-creator, FR-035/BR-008 KYC verification. BR-013: this is an
 * upgrade of the existing account, not a separate registration — creates a
 * creator_profiles row with status=null until KYC is submitted (4.4
 * Validation Rules: status can't leave null until kyc fields are filled).
 * Also owns the Admin-side of the same creator_profiles lifecycle
 * (approve/reject/ban — BR-001/008/019/020/023), since it's the same
 * entity's state machine, not a separate concern.
 */
class CreatorService
{
    public function __construct(
        private readonly NotificationService $notifications,
        private readonly CommissionService $commissions,
        private readonly AuditLogService $auditLog,
        private readonly FileUploadService $files,
    ) {}

    /** POST /account/become-creator — FR-041, plus brand_name/bio/portfolio_url (2026-07-22). */
    public function becomeCreator(User $user, array $data): CreatorProfile
    {
        if ($user->creatorProfile) {
            throw ValidationException::withMessages([
                'user' => ['Akun ini sudah mengajukan diri sebagai Creator.'],
            ]);
        }

        return CreatorProfile::create([
            'user_id' => $user->id,
            'slug' => $this->generateSlug($data['brand_name'] ?? $user->name),
            'brand_name' => $data['brand_name'] ?? null,
            'bio' => $data['bio'] ?? null,
            'portfolio_url' => $data['portfolio_url'] ?? null,
            'terms_accepted_at' => now(),
        ]);
    }

    /**
     * BR-008 (expanded 2026-07-22): full identity + payout destination,
     * plus a guardian branch when the submitted birth_date makes the
     * applicant under 18 — payout then goes to the guardian's account, not
     * the minor's own.
     */
    public function submitVerification(User $user, array $data): CreatorProfile
    {
        $profile = $user->creatorProfile;

        if (! $profile) {
            throw ValidationException::withMessages([
                'user' => ['Ajukan diri sebagai Creator terlebih dahulu.'],
            ]);
        }

        $isMinor = Carbon::parse($data['birth_date'])->age < 18;

        $profile->update([
            'kyc_full_name' => $data['kyc_full_name'],
            'kyc_id_number' => $data['kyc_id_number'],
            'birth_date' => $data['birth_date'],
            'address' => $data['address'],
            'ktp_photo_path' => $this->files->storeKycDocument($data['ktp_photo']),
            'payout_method' => $data['payout_method'],
            'payout_account_number' => $data['payout_account_number'],
            'payout_account_holder' => $data['payout_account_holder'],
            'guardian_name' => $isMinor ? $data['guardian_name'] : null,
            'guardian_id_number' => $isMinor ? $data['guardian_id_number'] : null,
            'guardian_consent_at' => $isMinor ? now() : null,
            'status' => 'menunggu_approval',
        ]);

        return $profile;
    }

    /** GET /creator/dashboard — FE-020. */
    public function dashboard(User $user): array
    {
        return [
            'total_designs' => $user->designs()->count(),
            'active_designs' => $user->designs()->where('status', 'aktif')->count(),
            'pending_designs' => $user->designs()->where('status', 'menunggu_approval')->count(),
        ];
    }

    /** GET /admin/creators/pending — Approval queue. */
    public function pending(): Collection
    {
        return CreatorProfile::query()
            ->where('status', 'menunggu_approval')
            ->with('user')
            ->latest()
            ->get();
    }

    /** POST /admin/creators/{id}/approve — BR-001/008. */
    public function approve(CreatorProfile $profile, User $admin): CreatorProfile
    {
        if ($profile->status !== 'menunggu_approval') {
            throw ValidationException::withMessages([
                'status' => ['Pengajuan Creator ini tidak sedang menunggu approval.'],
            ]);
        }

        $profile->update([
            'status' => 'aktif',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        $this->notifications->notify(
            $profile->user,
            'creator.approved',
            'Pengajuan Creator disetujui',
            'Selamat! Pengajuan Anda sebagai Creator telah disetujui.',
            $profile,
        );
        $this->auditLog->record($admin, 'creator.approve', $profile);

        return $profile;
    }

    /** POST /admin/creators/{id}/reject — reason wajib. */
    public function reject(CreatorProfile $profile, User $admin, string $reason): CreatorProfile
    {
        if ($profile->status !== 'menunggu_approval') {
            throw ValidationException::withMessages([
                'status' => ['Pengajuan Creator ini tidak sedang menunggu approval.'],
            ]);
        }

        $profile->update([
            'status' => 'ditolak',
            'rejection_reason' => $reason,
        ]);

        $this->notifications->notify(
            $profile->user,
            'creator.rejected',
            'Pengajuan Creator ditolak',
            "Pengajuan Anda sebagai Creator ditolak: {$reason}",
            $profile,
        );
        $this->auditLog->record($admin, 'creator.reject', $profile, $reason);

        return $profile;
    }

    /**
     * POST /admin/creators/{id}/ban — BR-019/020/023. Designs are pulled from
     * the marketplace unconditionally (Design::scopeActive() already excludes
     * banned creators). The extra account suspension + commission hold only
     * apply when the ban is for a *proven copyright violation* (BR-020) —
     * a plain ban does not touch the Customer side of the account or payable
     * commissions.
     */
    public function ban(CreatorProfile $profile, User $admin, string $reason, bool $copyrightViolation): CreatorProfile
    {
        $profile->update([
            'status' => 'banned',
            'rejection_reason' => $reason,
        ]);

        if ($copyrightViolation) {
            // 'status' isn't in User's #[Fillable] list (admin-only data, same
            // reasoning as the password reset in AuthController) — forceFill it.
            $profile->user->forceFill(['status' => UserStatus::Banned])->save();
            $this->commissions->holdAllTerhutangFor($profile->user);
        }

        $this->notifications->notify(
            $profile->user,
            'creator.banned',
            'Akun Creator diblokir',
            "Akun Creator Anda telah diblokir: {$reason}",
            $profile,
        );
        $this->auditLog->record($admin, 'creator.ban', $profile, $reason);

        return $profile;
    }

    private function generateSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 1;

        while (CreatorProfile::query()->where('slug', $slug)->exists()) {
            $slug = "{$base}-".$suffix++;
        }

        return $slug;
    }
}
