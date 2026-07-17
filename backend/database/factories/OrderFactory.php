<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = fake()->numberBetween(100, 1000) * 1000;

        return [
            'order_number' => 'HC-'.now()->format('Ymd').'-'.Str::padLeft((string) fake()->unique()->numberBetween(0, 9999), 4, '0'),
            'user_id' => User::factory(),
            'address_id' => Address::factory(),
            'type' => 'reguler',
            'status' => 'belum_dibayar',
            'subtotal' => $subtotal,
            'shipping_cost' => 0,
            'total' => $subtotal,
        ];
    }

    public function menungguApproval(): static
    {
        return $this->state(['status' => 'menunggu_approval']);
    }

    public function diprosesProduksi(): static
    {
        return $this->state(['status' => 'diproses_produksi']);
    }
}
