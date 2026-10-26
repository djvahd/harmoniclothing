<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;

/**
 * FE-032 Payment Gateway integration. Talks to Midtrans Snap directly via
 * Laravel's HTTP client (Http::fake()-testable) rather than the official
 * midtrans/midtrans-php SDK, which makes raw cURL calls that can't be faked
 * in tests the same way.
 */
class MidtransService
{
    /** @param  string|null  $paymentMethod  key of services.midtrans.payment_methods; null leaves every channel open in Snap */
    public function createSnapTransaction(Order $order, ?string $paymentMethod = null): string
    {
        $response = Http::withBasicAuth(config('services.midtrans.server_key'), '')
            ->post($this->snapUrl(), $this->snapPayload($order, $paymentMethod))
            ->throw();

        return $response->json('redirect_url');
    }

    private function snapPayload(Order $order, ?string $paymentMethod = null): array
    {
        $order->loadMissing(['user', 'items.productVariant.product']);

        $payload = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => (int) $order->total,
            ],
            'callbacks' => [
                'finish' => rtrim(config('app.frontend_url'), '/').'/account/orders/'.$order->id,
            ],
            // Same window the orders:cancel-unpaid command uses, so Snap never
            // accepts a payment for an order we have already cancelled.
            'expiry' => [
                'unit' => 'hours',
                'duration' => (int) config('business.unpaid_order_cancel_hours'),
            ],
        ];

        $enabledPayments = $paymentMethod !== null
            ? config("services.midtrans.payment_methods.{$paymentMethod}.snap")
            : null;
        if ($enabledPayments !== null) {
            $payload['enabled_payments'] = $enabledPayments;
        }

        if ($order->user !== null) {
            $payload['customer_details'] = array_filter([
                'first_name' => $order->user->name,
                'email' => $order->user->email,
                'phone' => $order->user->phone,
            ]);
        }

        $items = $this->itemDetails($order);
        if ($items !== null) {
            $payload['item_details'] = $items;
        }

        return $payload;
    }

    /**
     * Midtrans rejects the request when item_details do not add up to
     * gross_amount, so a mismatch (e.g. rounding) drops the list rather than
     * failing checkout.
     *
     * @return list<array<string, mixed>>|null
     */
    private function itemDetails(Order $order): ?array
    {
        $items = [];
        foreach ($order->items as $item) {
            $items[] = [
                'id' => 'item-'.$item->id,
                'price' => (int) $item->unit_price,
                'quantity' => (int) $item->quantity,
                'name' => mb_substr($item->productVariant?->product?->name_id ?? 'Produk', 0, 50),
            ];
        }

        if ((int) $order->shipping_cost > 0) {
            $items[] = ['id' => 'shipping', 'price' => (int) $order->shipping_cost, 'quantity' => 1, 'name' => 'Ongkos kirim'];
        }

        $sum = array_sum(array_map(fn ($i) => $i['price'] * $i['quantity'], $items));

        return $items !== [] && $sum === (int) $order->total ? $items : null;
    }

    /**
     * 5.3_API_Specification.md §8 POST /webhooks/midtrans: signature is
     * SHA512(order_id + status_code + gross_amount + ServerKey), verified
     * server-side before the notification is trusted.
     */
    public function verifySignature(array $payload): bool
    {
        $expected = hash('sha512',
            ($payload['order_id'] ?? '').($payload['status_code'] ?? '').($payload['gross_amount'] ?? '').config('services.midtrans.server_key')
        );

        return hash_equals($expected, $payload['signature_key'] ?? '');
    }

    /**
     * Server-to-server status check. verifySignature() only covers order_id +
     * status_code + gross_amount — transaction_status/fraud_status are not part
     * of the signed payload, so a captured notification could be replayed with
     * those fields edited. The webhook re-fetches the authoritative state from
     * here rather than trusting the notification body for anything that
     * determines payment/order state.
     */
    public function getTransactionStatus(string $orderId): array
    {
        $response = Http::withBasicAuth(config('services.midtrans.server_key'), '')
            ->get($this->statusUrl($orderId))
            ->throw();

        return $response->json();
    }

    private function snapUrl(): string
    {
        return config('services.midtrans.is_production')
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    }

    private function statusUrl(string $orderId): string
    {
        $base = config('services.midtrans.is_production')
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';

        return $base.'/v2/'.rawurlencode($orderId).'/status';
    }
}
