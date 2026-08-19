<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BiteshipWebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * FE-035 auto tracking resi — Biteship tracking webhook.
 *
 * Biteship doesn't document a request-signing scheme the way Midtrans does, so
 * authenticity is verified via a shared secret embedded as a query param on the
 * webhook URL registered in Biteship's dashboard (?token=...). Without this,
 * anyone who learns or guesses a biteship_order_id could POST fake status
 * updates for any shipment.
 */
class BiteshipWebhookController extends Controller
{
    public function __construct(private readonly BiteshipWebhookService $webhook) {}

    public function handle(Request $request): JsonResponse
    {
        $expected = config('services.biteship.webhook_token');

        abort_if(
            blank($expected) || ! hash_equals($expected, (string) $request->query('token')),
            403,
            'Invalid webhook token.'
        );

        $this->webhook->handle($request->all());

        return response()->json([]);
    }
}
