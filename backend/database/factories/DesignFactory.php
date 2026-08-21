<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Design;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;
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
            'file_path' => $this->placeholderPath('designs/placeholder.svg', 'design-placeholder.svg'),
            'thumbnail_path' => $this->placeholderPath('designs/thumbnails/placeholder.png', 'product-placeholder.png'),
            'status' => 'aktif',
        ];
    }

    /**
     * Seed data has no real creator-uploaded file (mirrors the same fake-path
     * bug fixed in ProductVariantFactory) — point every fake design at a
     * shared checked-in placeholder instead of a UUID nothing ever wrote to
     * disk, which 403'd through Next's image optimizer on every design card.
     */
    private function placeholderPath(string $relativePath, string $assetFilename): string
    {
        $disk = config('filesystems.public_disk');

        if (! Storage::disk($disk)->exists($relativePath)) {
            Storage::disk($disk)->put(
                $relativePath,
                file_get_contents(__DIR__.'/../seeders/assets/'.$assetFilename)
            );
        }

        return $relativePath;
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
