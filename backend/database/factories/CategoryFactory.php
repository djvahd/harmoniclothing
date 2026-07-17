<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name_id' => ucfirst($name),
            'name_en' => ucfirst($name),
            'slug' => Str::slug($name),
            'type' => fake()->randomElement(['product', 'design']),
        ];
    }

    public function product(): static
    {
        return $this->state(['type' => 'product']);
    }

    public function design(): static
    {
        return $this->state(['type' => 'design']);
    }
}
