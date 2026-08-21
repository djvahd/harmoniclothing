<?php

namespace Database\Factories;

use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * @extends Factory<CreatorProfile>
 */
class CreatorProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'slug' => Str::slug(fake()->unique()->name()),
        ];
    }

    public function menungguApproval(): static
    {
        return $this->state([
            'kyc_full_name' => fake()->name(),
            'kyc_id_number' => fake()->numerify('################'),
            'birth_date' => fake()->dateTimeBetween('-40 years', '-18 years')->format('Y-m-d'),
            'address' => fake()->address(),
            'ktp_photo_path' => $this->placeholderKtpPath(),
            'payout_method' => 'bank_transfer',
            'payout_account_number' => fake()->numerify('##########'),
            'payout_account_holder' => fake()->name(),
            'status' => 'menunggu_approval',
        ]);
    }

    /**
     * Same fake-path bug as ProductVariantFactory/DesignFactory: seed data
     * has no real KYC upload, so AdminCreatorController::kycDocument() 404'd
     * on every seeded creator's "Lihat KTP" link. Points at a shared
     * checked-in placeholder on the private disk instead.
     */
    private function placeholderKtpPath(): string
    {
        $disk = config('filesystems.private_disk');
        $relativePath = 'kyc-uploads/placeholder.jpg';

        if (! Storage::disk($disk)->exists($relativePath)) {
            Storage::disk($disk)->put(
                $relativePath,
                file_get_contents(__DIR__.'/../seeders/assets/kyc-placeholder.jpg')
            );
        }

        return $relativePath;
    }

    public function aktif(): static
    {
        return $this->menungguApproval()->state([
            'status' => 'aktif',
            'approved_at' => now(),
        ]);
    }

    public function banned(): static
    {
        return $this->aktif()->state(['status' => 'banned']);
    }
}
