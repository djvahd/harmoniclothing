<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;

/**
 * FR-022 Admin-triggered shipment booking (outbound). Mirrors
 * MidtransService's shape — a thin, Http::fake()-testable wrapper. Like
 * BiteshipWebhookService (inbound) already notes, Biteship's exact request/
 * response schema isn't in the specs available here; this assumes a
 * generic {id, courier.waybill_id} shape and should be adjusted once a real
 * sandbox account/API docs are available.
 */
class BiteshipService
{
    /** @return array{biteship_order_id: ?string, tracking_number: ?string} */
    public function createBooking(Order $order, string $courier): array
    {
        $response = Http::withHeaders(['Authorization' => config('services.biteship.api_key')])
            ->post('https://api.biteship.com/v1/orders', [
                'order_note' => $order->order_number,
                'courier_company' => $courier,
            ])
            ->throw();

        return [
            'biteship_order_id' => $response->json('id'),
            'tracking_number' => $response->json('courier.waybill_id'),
        ];
    }
}
