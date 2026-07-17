<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Design;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Design>
 */
class DesignFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->words(3, true);

        return [
            'creator_id' => User::factory(),
            'category_id' => Category::factory()->design(),
            'title' => ucfirst($title),
            'slug' => Str::slug($title),
            'description' => fake()->sentence(),
            'file_path' => 'designs/'.fake()->uuid().'.svg',
            'thumbnail_path' => 'designs/thumbnails/'.fake()->uuid().'.png',
            'status' => 'aktif',
        ];
    }

    public function pendingApproval(): static
    {
        return $this->state(['status' => 'menunggu_approval']);
    }

    public function rejected(): static
    {
        return $this->state([
            'status' => 'ditolak',
            'rejection_reason' => fake()->sentence(),
        ]);
    }
}
