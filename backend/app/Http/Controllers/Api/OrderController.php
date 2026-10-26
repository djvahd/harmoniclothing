<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewRequest;
use App\Http\Resources\CartItemResource;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ReviewResource;
use App\Services\OrderService;
use App\Services\PaymentService;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §4 — /orders (FE-028/029/031), scope own. */
class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
        private readonly PaymentService $payments,
        private readonly ReviewService $reviews,
    ) {}

    /** GET /orders */
    public function index(Request $request): JsonResponse
    {
        $orders = $this->orders->list($request->user(), (int) $request->query('per_page', 20));

        return response()->json([
            'data' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /** GET /orders/{order} — scoped to the user's own orders, 404s on a foreign id. */
    public function show(Request $request, int $order): JsonResponse
    {
        $order = $request->user()->orders()->with('items.productVariant.product', 'items.design', 'items.review', 'statusHistories', 'address')->findOrFail($order);

        return response()->json(['data' => new OrderResource($order)]);
    }

    /** POST /orders/{order}/cancel — FR-036, BR-010. */
    public function cancel(Request $request, int $order): JsonResponse
    {
        $order = $request->user()->orders()->findOrFail($order);
        $order = $this->orders->cancel($order);

        return response()->json(['data' => new OrderResource($order)]);
    }

    /**
     * POST /orders/{order}/pay — resume paying an unpaid order. Returns the
     * Snap URL saved at checkout (null while Midtrans credentials are unset).
     */
    public function pay(Request $request, int $order): JsonResponse
    {
        $order = $request->user()->orders()->with('payment')->findOrFail($order);

        return response()->json(['data' => ['midtrans_redirect_url' => $this->payments->resume($order)]]);
    }

    /** POST /orders/{order}/reorder — FR-019. */
    public function reorder(Request $request, int $order): JsonResponse
    {
        $order = $request->user()->orders()->findOrFail($order);
        $cartItems = $this->orders->reorder($order);

        return response()->json(['data' => CartItemResource::collection($cartItems)], 201);
    }

    /** GET /orders/{order}/invoice — FR-018. 404 if not paid yet (no invoice generated). */
    public function invoice(Request $request, int $order): JsonResponse
    {
        $order = $request->user()->orders()->findOrFail($order);
        // The invoice page lists the order lines, so items (and their product
        // names) must be loaded; the bare 'order' relation left `items` out and
        // crashed the page on order.items.map.
        $invoice = $order->invoice()->with('order.items.productVariant.product')->firstOrFail();

        return response()->json(['data' => new InvoiceResource($invoice)]);
    }

    /** POST /orders/{order}/confirm-received — FR-042, BR-014. */
    public function confirmReceived(Request $request, int $order): JsonResponse
    {
        $order = $request->user()->orders()->findOrFail($order);
        $order = $this->orders->confirmReceived($order);

        return response()->json(['data' => new OrderResource($order)]);
    }

    /** POST /orders/{order}/reviews — FR-027, BR-004. */
    public function storeReview(ReviewRequest $request, int $order): JsonResponse
    {
        $order = $request->user()->orders()->findOrFail($order);
        $review = $this->reviews->create($order, $request->user(), $request->validated());

        return response()->json(['data' => new ReviewResource($review)], 201);
    }
}
