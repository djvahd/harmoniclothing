<?php

namespace Database\Factories;

use App\Models\NotificationSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NotificationSetting>
 */
class NotificationSettingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'notification_type' => fake()->unique()->word(),
            'is_enabled' => true,
        ];
    }
}
