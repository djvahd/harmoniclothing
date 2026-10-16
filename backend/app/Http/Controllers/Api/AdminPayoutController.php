<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PayoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Manual creator commission payout by Admin (BR-007, revised 2026-10-16). */
class AdminPayoutController extends Controller
{
    public function __construct(private readonly PayoutService $payouts) {}

    /** GET /admin/payouts — unpaid commissions grouped per creator. */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->payouts->summary(),
            'meta' => ['minimum' => number_format((float) config('business.creator_payout_minimum'), 2, '.', '')],
        ]);
    }

    /** POST /admin/payouts/{creator} — record the transfer reference and mark that creator's commissions paid. */
    public function pay(Request $request, int $creator): JsonResponse
    {
        $data = $request->validate(['reference' => ['required', 'string', 'min:3', 'max:100']]);

        return response()->json(['data' => $this->payouts->markPaid($creator, $data['reference'], $request->user())]);
    }
}
