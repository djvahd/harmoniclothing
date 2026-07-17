<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Address>
 */
class AddressFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'label' => fake()->randomElement(['Rumah', 'Kantor', 'Kampus']),
            'recipient_name' => fake()->name(),
            'phone' => fake()->numerify('08##########'),
            'province' => fake()->state(),
            'city' => fake()->city(),
            'district' => fake()->citySuffix(),
            'postal_code' => fake()->numerify('#####'),
            'address_line' => fake()->streetAddress(),
            'is_default' => false,
        ];
    }
}
