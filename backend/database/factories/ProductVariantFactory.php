<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'color' => fake()->randomElement(['Hitam', 'Putih', 'Navy', 'Merah', 'Abu-abu']),
            'size' => fake()->randomElement(['S', 'M', 'L', 'XL', 'XXL']),
            'cut_type' => fake()->randomElement(['Regular Fit', 'Oversize']),
            'print_areas' => fake()->randomElements(['depan', 'belakang', 'lengan'], fake()->numberBetween(1, 3)),
            'material' => fake()->randomElement(['Cotton Combed 24s', 'Cotton Combed 30s', 'Fleece']),
            'price_modifier' => 0,
            'mockup_asset_path' => 'mockups/'.fake()->uuid().'.glb',
        ];
    }
}
