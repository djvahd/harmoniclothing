<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Repositories\CartRepository;
use App\Repositories\OrderRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

/** FE-028 Riwayat Pesanan, FE-029 Reorder, FE-031 Pembatalan Pesanan. */
class OrderService
{
    public function __construct(
        private readonly OrderRepository $orders,
        private readonly CartRepository $cart,
        private readonly PricingService $pricing,
    ) {}

    public function list(User $user, int $perPage): LengthAwarePaginator
    {
        return $this->orders->paginateForUser($user, $perPage);
    }

    /**
     * BR-010: cancellable only while "menunggu_approval" — once production
     * has started, cancellation is not available.
     */
    public function cancel(Order $order): Order
    {
        if ($order->status !== 'menunggu_approval') {
            throw ValidationException::withMessages([
                'status' => ['Pesanan hanya dapat dibatalkan selama status Menunggu Approval.'],
            ]);
        }

        $order->update([
            'status' => 'dibatalkan',
            'cancelled_at' => now(),
            'cancelled_by' => 'customer',
        ]);

        $this->orders->recordStatusHistory($order, 'menunggu_approval', 'dibatalkan', 'customer', $order->user_id);

        return $order;
    }

    /**
     * FR-042/BR-014: Customer confirms receipt while "menunggu_konfirmasi",
     * completing the order immediately (rating/review form shows in the
     * same flow per BR-004 — the frontend's job, not this endpoint's).
     */
    public function confirmReceived(Order $order): Order
    {
        if ($order->status !== 'menunggu_konfirmasi') {
            throw ValidationException::withMessages([
                'status' => ['Pesanan hanya dapat dikonfirmasi selama status Menunggu Konfirmasi.'],
            ]);
        }

        $order->update(['status' => 'selesai', 'confirmed_at' => now(), 'completed_at' => now()]);
        $this->orders->recordStatusHistory($order, 'menunggu_konfirmasi', 'selesai', 'customer', $order->user_id);

        return $order;
    }

    /**
     * FR-019 reorder: re-adds this order's items to the cart at *current*
     * prices (a fresh purchase, not a replay of the original order's locked
     * price — BR-025's snapshot lock only applies going forward from the
     * moment an item is (re-)added). Items whose product has since been
     * deactivated are silently skipped.
     */
    public function reorder(Order $order): Collection
    {
        return $order->items()->with('productVariant.product')->get()
            ->filter(fn ($item) => $item->productVariant->product->is_active)
            ->map(fn ($item) => $this->cart->create([
                'user_id' => $order->user_id,
                'product_variant_id' => $item->product_variant_id,
                'design_id' => $item->design_id,
                'custom_design_file_path' => $item->custom_design_file_path,
                'design_position' => $item->design_position,
                'quantity' => $item->quantity,
                'unit_price_snapshot' => $this->pricing->unitPriceFor($item->productVariant),
            ]));
    }
}
