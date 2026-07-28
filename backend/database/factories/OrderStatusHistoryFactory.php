<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderStatusHistory>
 */
class OrderStatusHistoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'from_status' => 'belum_dibayar',
            'to_status' => 'menunggu_approval',
            'changed_by' => 'system',
            'actor_id' => null,
            'reason' => null,
        ];
    }

    public function byAdmin(int $adminId): static
    {
        return $this->state([
            'changed_by' => 'admin',
            'actor_id' => $adminId,
        ]);
    }
}
