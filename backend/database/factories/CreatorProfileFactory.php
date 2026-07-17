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
