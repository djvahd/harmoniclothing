<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Http\Resources\CartItemResource;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §3 — /cart (FE-025), scope own. */
class CartController extends Controller
{
    public function __construct(private readonly CartService $cart) {}

    /** GET /cart */
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => CartItemResource::collection($this->cart->list($request->user())),
        ]);
    }

    /** POST /cart */
    public function store(CartItemRequest $request): JsonResponse
    {
        $item = $this->cart->add($request->user(), $request->validated());

        return response()->json(['data' => new CartItemResource($item)], 201);
    }

    /**
     * PATCH /cart/{item} — scoped to the user's own cart so a foreign id
     * 404s (5.3_API_Specification.md §7, same pattern as account/addresses).
     */
    public function update(UpdateCartItemRequest $request, int $item): JsonResponse
    {
        $cartItem = $request->user()->cartItems()->findOrFail($item);
        $cartItem = $this->cart->update($cartItem, $request->validated());

        return response()->json(['data' => new CartItemResource($cartItem)]);
    }

    /** DELETE /cart/{item} */
    public function destroy(Request $request, int $item): JsonResponse
    {
        $cartItem = $request->user()->cartItems()->findOrFail($item);
        $this->cart->remove($cartItem);

        return response()->json(['data' => null]);
    }
}
