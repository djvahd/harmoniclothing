<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderStatusRequest;
use App\Http\Requests\ReasonRequest;
use App\Http\Requests\ShipmentRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ShipmentResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §6 — Production queue & order status (FR-021, FR-043). */
class AdminOrderController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    /** GET /admin/orders — admin management list (gap-filled); all 8 statuses, unlike production-queue's 2. */
    public function index(Request $request): JsonResponse
    {
        $request->validate(['per_page' => ['sometimes', 'integer', 'min:1', 'max:100']]);

        $orders = $this->orders->listAllOrders(
            $request->query('status'),
            (int) $request->query('per_page', 20),
            $request->query('search'),
        );

        return response()->json([
            'data' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /** GET /admin/production-queue — FR-021. */
    public function productionQueue(): JsonResponse
    {
        return response()->json(['data' => OrderResource::collection($this->orders->productionQueue())]);
    }

    /** PATCH /admin/orders/{order}/status — FR-021. */
    public function updateStatus(OrderStatusRequest $request, Order $order): JsonResponse
    {
        $order = $this->orders->updateStatus($order, $request->user());

        return response()->json(['data' => new OrderResource($order)]);
    }

    /** POST /admin/orders/{order}/reject — FR-043, 409 if status already changed. */
    public function reject(ReasonRequest $request, Order $order): JsonResponse
    {
        $order = $this->orders->reject($order, $request->user(), $request->validated('reason'));

        return response()->json(['data' => new OrderResource($order)]);
    }

    /** POST /admin/orders/{order}/shipment — FR-022, Biteship booking. */
    public function bookShipment(ShipmentRequest $request, Order $order): JsonResponse
    {
        $shipment = $this->orders->bookShipment(
            $order,
            $request->user(),
            $request->validated('courier_company'),
            $request->validated('courier_type'),
        );

        return response()->json(['data' => new ShipmentResource($shipment)], 201);
    }
}
