<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'invoice_number' => 'INV-'.now()->format('Ymd').'-'.Str::padLeft((string) fake()->unique()->numberBetween(0, 9999), 4, '0'),
            'issued_at' => now(),
        ];
    }
}
