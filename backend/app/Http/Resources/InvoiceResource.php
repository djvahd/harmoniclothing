<?php

namespace App\Http\Resources;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Invoice */
class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'invoice_number' => $this->invoice_number,
            'issued_at' => $this->issued_at,
            'order' => new OrderResource($this->whenLoaded('order')),
        ];
    }
}
