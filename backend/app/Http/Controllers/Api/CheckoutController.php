<?php

namespace App\Http\Controllers\Api;

use App\DTO\CheckoutDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutBulkRequest;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Services\CheckoutService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §4 — /checkout (FE-027), /checkout/bulk (FE-052/056). */
class CheckoutController extends Controller
{
    public function __construct(
        private readonly CheckoutService $checkout,
        private readonly PaymentService $payments,
    ) {}

    /** POST /checkout */
    public function store(CheckoutRequest $request): JsonResponse
    {
        $dto = new CheckoutDTO(
            addressId: (int) $request->validated('address_id'),
            cartItemIds: $request->validated('cart_item_ids'),
            type: 'reguler',
            notes: $request->validated('notes'),
        );

        $order = $this->checkout->checkout($request->user(), $dto);

        return $this->respondWithPayment($order, $request);
    }

    /** POST /checkout/bulk */
    public function storeBulk(CheckoutBulkRequest $request): JsonResponse
    {
        $dto = new CheckoutDTO(
            addressId: (int) $request->validated('address_id'),
            cartItemIds: $request->validated('cart_item_ids'),
            type: 'bulk',
            notes: $request->validated('notes'),
        );

        $order = $this->checkout->checkoutBulk($request->user(), $dto);

        return $this->respondWithPayment($order, $request);
    }

    /**
     * 5.3_API_Specification.md §8 example response includes
     * midtrans_redirect_url — null locally until real Midtrans credentials
     * exist (PaymentService::initiate() note).
     */
    private function respondWithPayment($order, Request $request): JsonResponse
    {
        $redirectUrl = $this->payments->initiate($order);

        return response()->json([
            'data' => [
                ...(new OrderResource($order))->toArray($request),
                'midtrans_redirect_url' => $redirectUrl,
            ],
        ], 201);
    }
}
