<?php

namespace App\Repositories;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Support\Str;

class OrderRepository
{
    public function create(array $attributes): Order
    {
        $order = Order::create([...$attributes, 'order_number' => $this->generateOrderNumber()]);

        return $order;
    }

    public function addItems(Order $order, array $itemsAttributes): void
    {
        $order->items()->createMany($itemsAttributes);
    }

    public function recordStatusHistory(
        Order $order,
        ?string $from,
        string $to,
        string $changedBy,
        ?int $actorId = null,
        ?string $reason = null,
    ): OrderStatusHistory {
        return OrderStatusHistory::create([
            'order_id' => $order->id,
            'from_status' => $from,
            'to_status' => $to,
            'changed_by' => $changedBy,
            'actor_id' => $actorId,
            'reason' => $reason,
        ]);
    }

    /** HC-{yyyymmdd}-{random 4 digits}, matching the 5.3_API_Specification.md §8 example format. */
    private function generateOrderNumber(): string
    {
        do {
            $candidate = 'HC-'.now()->format('Ymd').'-'.Str::padLeft((string) random_int(0, 9999), 4, '0');
        } while (Order::query()->where('order_number', $candidate)->exists());

        return $candidate;
    }
}
