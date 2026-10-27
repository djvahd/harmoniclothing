<?php

namespace Database\Factories;

use App\Models\Voucher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Voucher>
 */
class VoucherFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->bothify('PROMO####')),
            'type' => Voucher::TYPE_NOMINAL,
            'value' => 10000,
            'max_discount' => null,
            'min_subtotal' => 0,
            'quota' => null,
            'starts_at' => null,
            'expires_at' => null,
            'is_active' => true,
        ];
    }

    public function percent(int $percent, ?int $cap = null): static
    {
        return $this->state(['type' => Voucher::TYPE_PERCENT, 'value' => $percent, 'max_discount' => $cap]);
    }

    public function freeShipping(?int $cap = null): static
    {
        return $this->state(['type' => Voucher::TYPE_FREE_SHIPPING, 'value' => 0, 'max_discount' => $cap]);
    }
}
