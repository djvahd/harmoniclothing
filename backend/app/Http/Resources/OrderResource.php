<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Order */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'type' => $this->type,
            'status' => $this->status,
            'rejection_reason' => $this->rejection_reason,
            'notes' => $this->notes,
            'subtotal' => $this->subtotal,
            'shipping_cost' => $this->shipping_cost,
            'discount_amount' => $this->discount_amount,
            // Lazy-loads the voucher only for orders that used one. A plain value, not when(): CheckoutController
            // spreads toArray(), which would leave a MissingValue object in the JSON.
            'voucher_code' => $this->voucher_id !== null ? $this->voucher?->code : null,
            'courier_company' => $this->courier_company,
            'courier_type' => $this->courier_type,
            'total' => $this->total,
            'created_at' => $this->created_at,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            // Status timeline (order detail page): when each status was reached. Actor/reason stay internal.
            'status_history' => $this->whenLoaded('statusHistories', fn () => $this->statusHistories->map(fn ($h) => [
                'status' => $h->to_status,
                'at' => $h->created_at,
            ])->values()),
            // Shipping address (order detail only; the order keeps no snapshot, so this is the current address row).
            'address' => $this->whenLoaded('address', fn () => $this->address ? [
                'recipient_name' => $this->address->recipient_name,
                'phone' => $this->address->phone,
                'address_line' => $this->address->address_line,
                'district' => $this->address->district,
                'city' => $this->address->city,
                'province' => $this->address->province,
                'postal_code' => $this->address->postal_code,
            ] : null),
            'shipment' => $this->shipment ? new ShipmentResource($this->shipment) : null, // FE-036
            'user' => $this->whenLoaded('user', fn () => new UserResource($this->user)), // GET /admin/orders (gap-filled)
        ];
    }
}
