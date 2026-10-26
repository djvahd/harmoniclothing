<?php

namespace App\Repositories;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class OrderRepository
{
    /**
     * GET /orders — FR-019, scope own. Eager-loads the same nested relations
     * as OrderController::show() (items.productVariant.product, items.design,
     * shipment) - OrderItemResource/OrderResource read these unconditionally,
     * so omitting them here crashed the frontend list view with `product_variant`
     * missing on every item (caught via live browser testing 2026-07-20).
     */
    public function paginateForUser(User $user, int $perPage): LengthAwarePaginator
    {
        return $user->orders()
            ->with(['items.productVariant.product', 'items.design', 'shipment'])
            ->latest()->latest('id')
            ->paginate($perPage);
    }

    /**
     * GET /admin/orders — admin management list (gap-filled). Unlike
     * OrderService::productionQueue() (only 2 of 8 statuses, unpaginated),
     * this covers every status with an optional filter, paginated, same
     * eager-load set as paginateForUser() plus 'user' for the admin view.
     */
    public function paginateAll(?string $status, int $perPage, ?string $search = null): LengthAwarePaginator
    {
        return Order::query()
            ->when($status, fn ($query, $status) => $query->where('status', $status))
            ->when($search, fn ($query, $search) => $query->where(
                fn ($q) => $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
            ))
            ->with(['items.productVariant.product', 'items.design', 'shipment', 'user'])
            ->latest()->latest('id')
            ->paginate($perPage);
    }

    public function create(array $attributes): Order
    {
        $order = Order::create([...$attributes, 'order_number' => $this->generateOrderNumber()]);

        return $order;
    }

    public function addItems(Order $order, array $itemsAttributes): void
    {
        $order->items()->createMany($itemsAttributes);
    }

    public function recordStatusHistory(
        Order $order,
        ?string $from,
        string $to,
        string $changedBy,
        ?int $actorId = null,
        ?string $reason = null,
    ): OrderStatusHistory {
        return OrderStatusHistory::create([
            'order_id' => $order->id,
            'from_status' => $from,
            'to_status' => $to,
            'changed_by' => $changedBy,
            'actor_id' => $actorId,
            'reason' => $reason,
        ]);
    }

    /** HC-{yyyymmdd}-{random 4 digits}, matching the 5.3_API_Specification.md §8 example format. */
    private function generateOrderNumber(): string
    {
        do {
            $candidate = 'HC-'.now()->format('Ymd').'-'.Str::padLeft((string) random_int(0, 9999), 4, '0');
        } while (Order::query()->where('order_number', $candidate)->exists());

        return $candidate;
    }
}
