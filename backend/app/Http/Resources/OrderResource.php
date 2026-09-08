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
            'courier_company' => $this->courier_company,
            'courier_type' => $this->courier_type,
            'total' => $this->total,
            'created_at' => $this->created_at,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'shipment' => $this->shipment ? new ShipmentResource($this->shipment) : null, // FE-036
            'user' => $this->whenLoaded('user', fn () => new UserResource($this->user)), // GET /admin/orders (gap-filled)
        ];
    }
}
