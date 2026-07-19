<?php

namespace App\Http\Resources;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Payment */
class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'method' => $this->method,
            'amount' => $this->amount,
            'status' => $this->status,
            'paid_at' => $this->paid_at,
            'order' => [
                'id' => $this->order->id,
                'order_number' => $this->order->order_number,
                'user' => [
                    'id' => $this->order->user->id,
                    'name' => $this->order->user->name,
                ],
            ],
        ];
    }
}
