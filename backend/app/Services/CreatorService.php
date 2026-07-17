<?php

namespace App\Services;

use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * FR-041 become-creator, FR-035/BR-008 KYC verification. BR-013: this is an
 * upgrade of the existing account, not a separate registration — creates a
 * creator_profiles row with status=null until KYC is submitted (4.4
 * Validation Rules: status can't leave null until kyc fields are filled).
 */
class CreatorService
{
    public function becomeCreator(User $user): CreatorProfile
    {
        if ($user->creatorProfile) {
            throw ValidationException::withMessages([
                'user' => ['Akun ini sudah mengajukan diri sebagai Creator.'],
            ]);
        }

        return CreatorProfile::create([
            'user_id' => $user->id,
            'slug' => $this->generateSlug($user->name),
        ]);
    }

    /** BR-008: KYC required before approval can be requested. */
    public function submitVerification(User $user, array $data): CreatorProfile
    {
        $profile = $user->creatorProfile;

        if (! $profile) {
            throw ValidationException::withMessages([
                'user' => ['Ajukan diri sebagai Creator terlebih dahulu.'],
            ]);
        }

        $profile->update([
            'kyc_full_name' => $data['kyc_full_name'],
            'kyc_id_number' => $data['kyc_id_number'],
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
