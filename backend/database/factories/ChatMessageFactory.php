<?php

namespace Database\Factories;

use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChatMessage>
 */
class ChatMessageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'thread_id' => ChatThread::factory(),
            'sender_id' => User::factory(),
            'sender_role' => 'customer',
            'message' => fake()->sentence(),
        ];
    }
}
