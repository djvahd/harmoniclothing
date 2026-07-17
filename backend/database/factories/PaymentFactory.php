<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'amount' => fake()->numberBetween(100, 1000) * 1000,
            'status' => 'belum_dibayar',
        ];
    }

    public function berhasil(): static
    {
        return $this->state([
            'status' => 'berhasil',
            'paid_at' => now(),
            'method' => 'bank_transfer',
        ]);
    }
}
