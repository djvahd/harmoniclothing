<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BiteshipWebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** FE-035 auto tracking resi — Biteship tracking webhook. */
class BiteshipWebhookController extends Controller
{
    public function __construct(private readonly BiteshipWebhookService $webhook) {}

    public function handle(Request $request): JsonResponse
    {
        $this->webhook->handle($request->all());

        return response()->json([]);
    }
}
