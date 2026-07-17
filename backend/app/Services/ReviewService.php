<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Review;
use App\Models\User;
use Illuminate\Validation\ValidationException;

/** FR-027 Rating & Review, BR-004: only after order status "selesai", per item not per order. */
class ReviewService
{
    public function create(Order $order, User $user, array $data): Review
    {
        if ($order->status !== 'selesai') {
            throw ValidationException::withMessages([
                'status' => ['Rating hanya dapat diberikan setelah pesanan Selesai.'],
            ]);
        }

        $item = $order->items()->find($data['order_item_id']);

        if (! $item) {
            throw ValidationException::withMessages([
                'order_item_id' => ['Item tidak ditemukan pada pesanan ini.'],
            ]);
        }

        if ($item->review) {
            throw ValidationException::withMessages([
                'order_item_id' => ['Item ini sudah direview sebelumnya.'],
            ]);
        }

        return Review::create([
            'order_item_id' => $item->id,
            'user_id' => $user->id,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ]);
    }
}
