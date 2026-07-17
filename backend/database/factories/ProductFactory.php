<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'category_id' => Category::factory()->product(),
            'name_id' => ucfirst($name),
            'name_en' => ucfirst($name),
            'description_id' => fake()->paragraph(),
            'description_en' => fake()->paragraph(),
            'slug' => Str::slug($name),
            'base_price' => fake()->numberBetween(50, 500) * 1000,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
