<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MidtransService;
use App\Services\MidtransWebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * 5.3_API_Specification.md §8 POST /webhooks/midtrans — "pola: webhook,
 * verifikasi signature bukan sesi user". Not behind auth:sanctum; Midtrans
 * itself is the caller, authenticated by signature instead of a session.
 */
class MidtransWebhookController extends Controller
{
    public function __construct(
        private readonly MidtransService $midtrans,
        private readonly MidtransWebhookService $webhook,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        abort_unless($this->midtrans->verifySignature($payload), 403, 'Invalid signature.');

        // transaction_status/fraud_status aren't covered by the signature — re-fetch
        // the authoritative status server-to-server rather than trusting the body.
        $status = $this->midtrans->getTransactionStatus($payload['order_id']);

        $this->webhook->handle($status);

        return response()->json([]); // Midtrans only checks the status code, not the body
    }
}
