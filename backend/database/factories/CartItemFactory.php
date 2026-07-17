<?php

namespace Database\Factories;

use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CartItem>
 */
class CartItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'product_variant_id' => ProductVariant::factory(),
            'quantity' => fake()->numberBetween(1, 5),
            'unit_price_snapshot' => fake()->numberBetween(50, 500) * 1000,
        ];
    }

    public function customUpload(): static
    {
        return $this->state([
            'design_id' => null,
            'custom_design_file_path' => 'design-uploads/'.fake()->uuid().'.png',
            'design_position' => ['x' => 0, 'y' => 0, 'rotation' => 0, 'scale' => 1],
        ]);
    }
}
