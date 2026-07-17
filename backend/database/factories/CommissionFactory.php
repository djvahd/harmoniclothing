<?php

namespace Database\Factories;

use App\Models\Commission;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Commission>
 */
class CommissionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'creator_id' => User::factory(),
            'order_item_id' => OrderItem::factory(),
            'amount' => fake()->numberBetween(10, 100) * 1000,
            'status' => 'terhutang',
        ];
    }
}
