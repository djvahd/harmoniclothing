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
    public function createSnapTransaction(Order $order): string
    {
        $response = Http::withBasicAuth(config('services.midtrans.server_key'), '')
            ->post($this->snapUrl(), [
                'transaction_details' => [
                    'order_id' => $order->order_number,
                    'gross_amount' => (int) $order->total,
                ],
            ])
            ->throw();

        return $response->json('redirect_url');
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
