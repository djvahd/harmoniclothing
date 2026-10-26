<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

/**
 * Biteship shipping integration (rate-check + admin-triggered booking).
 * Schema verified against Biteship's real Sandbox API and official docs
 * (biteship.com/en/docs/api) on 2026-09-08 — unlike the original version of
 * this class, these request/response shapes are not guesses.
 */
class BiteshipService
{
    /**
     * Valid courier/service pairs for the admin override dropdown: companies from
     * BITESHIP_COURIERS, types from the static map. No Biteship API call.
     *
     * @return array<int, array{company: string, types: array<int, string>}>
     */
    public function availableCouriers(): array
    {
        $companies = array_filter(array_map('trim', explode(',', (string) config('services.biteship.couriers'))));
        $map = config('services.biteship.courier_types', []);

        $couriers = [];
        foreach ($companies as $company) {
            if (! empty($map[$company])) {
                $couriers[] = ['company' => $company, 'types' => array_values($map[$company])];
            }
        }

        return $couriers;
    }

    /**
     * POST /checkout/shipping-rates — customer-facing rate check, called
     * server-side both when the customer previews rates and again (with the
     * customer's chosen courier) during checkout itself, so the price
     * actually charged always comes from Biteship, never from the client.
     *
     * @return array<int, array{courier_company: string, courier_type: string, courier_service_name: string, price: int, duration: string}>
     */
    public function getRates(string $destinationPostalCode, int $totalWeightGrams): array
    {
        // Degrades the same way PaymentService/Midtrans and FileUploadService/R2
        // do elsewhere in this codebase — no credentials configured yet (fresh
        // clone, CI, local dev) shouldn't hard-fail the whole checkout flow.
        if (blank(config('services.biteship.api_key'))) {
            return [];
        }

        $response = Http::withHeaders(['Authorization' => config('services.biteship.api_key')])
            ->post('https://api.biteship.com/v1/rates/couriers', [
                'origin_postal_code' => (int) config('services.biteship.origin_postal_code'),
                'destination_postal_code' => (int) $destinationPostalCode,
                'couriers' => config('services.biteship.couriers'),
                'items' => [[
                    'name' => 'Produk Harmoni Clothing',
                    'description' => 'Pesanan custom apparel',
                    'value' => 1,
                    'weight' => $totalWeightGrams,
                    'quantity' => 1,
                ]],
            ]);

        // A 4xx here is usually a legitimate business case (invalid/unrecognized
        // postal code, no courier serves that route) rather than a system fault —
        // surface it as "no rates available" instead of a raw 500. throw() still
        // covers genuine outages (5xx, network failure, timeout).
        if ($response->clientError()) {
            return [];
        }

        $response->throw();

        return Collection::make($response->json('pricing', []))
            ->map(fn (array $option) => [
                'courier_company' => $option['courier_code'],
                'courier_type' => $option['courier_service_code'],
                'courier_service_name' => $option['courier_name'].' '.$option['courier_service_name'],
                'price' => (int) $option['price'],
                'duration' => $option['duration'] ?? null,
            ])
            ->all();
    }

    /**
     * Re-runs getRates() and picks out the one matching the given
     * courier — used at checkout time to get the authoritative price for
     * the courier the customer picked (never trust a client-supplied price).
     */
    public function rateFor(string $destinationPostalCode, int $totalWeightGrams, string $courierCompany, string $courierType): ?array
    {
        return Collection::make($this->getRates($destinationPostalCode, $totalWeightGrams))
            ->first(fn (array $option) => $option['courier_company'] === $courierCompany && $option['courier_type'] === $courierType);
    }

    /**
     * POST /admin/orders/{id}/shipment — FR-022. Books the actual pickup
     * with Biteship using the courier chosen at checkout (or an admin
     * override — see OrderService::bookShipment()).
     *
     * @return array{biteship_order_id: ?string, tracking_number: ?string}
     */
    public function createBooking(Order $order, string $courierCompany, string $courierType): array
    {
        $order->loadMissing('address', 'items.productVariant.product');

        $response = Http::withHeaders(['Authorization' => config('services.biteship.api_key')])
            ->post('https://api.biteship.com/v1/orders', [
                'courier_company' => $courierCompany,
                'courier_type' => $courierType,
                'delivery_type' => 'now',
                'reference_id' => $order->order_number,
                'origin_contact_name' => config('services.biteship.origin_name'),
                'origin_contact_phone' => config('services.biteship.origin_phone'),
                'origin_address' => config('services.biteship.origin_address'),
                'origin_postal_code' => (int) config('services.biteship.origin_postal_code'),
                'destination_contact_name' => $order->address->recipient_name,
                'destination_contact_phone' => $order->address->phone,
                'destination_address' => $order->address->address_line.', '.$order->address->district.', '.$order->address->city.', '.$order->address->province,
                'destination_postal_code' => (int) $order->address->postal_code,
                'items' => $order->items->map(fn ($item) => [
                    'name' => $item->productVariant->product->name,
                    'value' => (int) $item->unit_price,
                    'weight' => config('services.biteship.item_weight_grams'),
                    'quantity' => $item->quantity,
                ])->all(),
            ])
            ->throw();

        return [
            'biteship_order_id' => $response->json('id'),
            'tracking_number' => $response->json('courier.waybill_id'),
        ];
    }
}
