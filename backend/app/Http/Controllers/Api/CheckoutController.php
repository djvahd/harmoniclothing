<?php

namespace App\Http\Controllers\Api;

use App\DTO\CheckoutDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutBulkRequest;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;

/** 5.2_API_List.md §4 — /checkout (FE-027), /checkout/bulk (FE-052/056). */
class CheckoutController extends Controller
{
    public function __construct(private readonly CheckoutService $checkout) {}

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

        return response()->json(['data' => new OrderResource($order)], 201);
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

        return response()->json(['data' => new OrderResource($order)], 201);
    }
}
