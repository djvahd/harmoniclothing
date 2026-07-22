<?php

namespace Database\Factories;

use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
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
            'ktp_photo_path' => 'kyc-uploads/'.fake()->uuid().'.jpg',
            'payout_method' => 'bank_transfer',
            'payout_account_number' => fake()->numerify('##########'),
            'payout_account_holder' => fake()->name(),
            'status' => 'menunggu_approval',
        ]);
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
