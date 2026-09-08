<?php

namespace App\Http\Controllers\Api;

use App\DTO\BulkCheckoutDTO;
use App\DTO\CheckoutDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\BulkCheckoutRequest;
use App\Http\Requests\CheckoutRequest;
use App\Http\Requests\ShippingRateRequest;
use App\Http\Resources\OrderResource;
use App\Services\CheckoutService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §4 — /checkout (FE-027) and /checkout/bulk (FE-052/056, BR-026: never mixed with regular). */
class CheckoutController extends Controller
{
    public function __construct(
        private readonly CheckoutService $checkout,
        private readonly PaymentService $payments,
    ) {}

    /** POST /checkout/shipping-rates — preview courier options before checking out. */
    public function shippingRates(ShippingRateRequest $request): JsonResponse
    {
        $rates = $this->checkout->getShippingRates(
            $request->user(),
            (int) $request->validated('address_id'),
            $request->validated('cart_item_ids', []) ?? [],
            $request->validated('items', []) ?? [],
        );

        return response()->json(['data' => $rates]);
    }

    /** POST /checkout */
    public function store(CheckoutRequest $request): JsonResponse
    {
        $dto = new CheckoutDTO(
            addressId: (int) $request->validated('address_id'),
            cartItemIds: $request->validated('cart_item_ids'),
            courierCompany: $request->validated('courier_company'),
            courierType: $request->validated('courier_type'),
            notes: $request->validated('notes'),
        );

        $order = $this->checkout->checkout($request->user(), $dto);

        return $this->respondWithPayment($order, $request);
    }

    /** POST /checkout/bulk — Flow 7, always creates orders.type = 'bulk'. */
    public function storeBulk(BulkCheckoutRequest $request): JsonResponse
    {
        $dto = new BulkCheckoutDTO(
            addressId: (int) $request->validated('address_id'),
            items: $request->validated('items'),
            courierCompany: $request->validated('courier_company'),
            courierType: $request->validated('courier_type'),
            designId: $request->validated('design_id') ? (int) $request->validated('design_id') : null,
            customDesignFilePath: $request->validated('custom_design_file_path'),
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
