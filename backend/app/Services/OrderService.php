<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Shipment;
use App\Models\User;
use App\Repositories\CartRepository;
use App\Repositories\OrderRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

/** FE-028 Riwayat Pesanan, FE-029 Reorder, FE-031 Pembatalan Pesanan. */
class OrderService
{
    public function __construct(
        private readonly OrderRepository $orders,
        private readonly CartRepository $cart,
        private readonly PricingService $pricing,
        private readonly NotificationService $notifications,
        private readonly BiteshipService $biteship,
        private readonly AuditLogService $auditLog,
    ) {}

    public function list(User $user, int $perPage): LengthAwarePaginator
    {
        return $this->orders->paginateForUser($user, $perPage);
    }

    /**
     * Re-fetches the order with a row lock inside the caller's transaction, so
     * concurrent status transitions (two admin actions, or an admin action
     * racing a webhook) see a consistent status instead of a stale in-memory
     * copy — closes a TOCTOU gap between the status check and the update.
     */
    private function lockOrder(Order $order): Order
    {
        return Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
    }

    /**
     * BR-010: cancellable only while "menunggu_approval" — once production
     * has started, cancellation is not available.
     */
    public function cancel(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $order = $this->lockOrder($order);

            if ($order->status !== 'menunggu_approval') {
                throw ValidationException::withMessages([
                    'status' => [__('messages.order.cancel_invalid_status')],
                ]);
            }

            $order->update([
                'status' => 'dibatalkan',
                'cancelled_at' => now(),
                'cancelled_by' => 'customer',
            ]);

            $this->orders->recordStatusHistory($order, 'menunggu_approval', 'dibatalkan', 'customer', $order->user_id);

            return $order;
        });
    }

    /**
     * FR-042/BR-014: Customer confirms receipt while "menunggu_konfirmasi",
     * completing the order immediately (rating/review form shows in the
     * same flow per BR-004 — the frontend's job, not this endpoint's).
     */
    public function confirmReceived(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $order = $this->lockOrder($order);

            if ($order->status !== 'menunggu_konfirmasi') {
                throw ValidationException::withMessages([
                    'status' => [__('messages.order.confirm_invalid_status')],
                ]);
            }

            $order->update(['status' => 'selesai', 'confirmed_at' => now(), 'completed_at' => now()]);
            $this->orders->recordStatusHistory($order, 'menunggu_konfirmasi', 'selesai', 'customer', $order->user_id);

            return $order;
        });
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

    /** GET /admin/orders — admin management list (gap-filled), all 8 statuses, optional filter. */
    public function listAllOrders(?string $status, int $perPage): LengthAwarePaginator
    {
        return $this->orders->paginateAll($status, $perPage);
    }

    /** GET /admin/production-queue — FR-021: orders awaiting or already in production. */
    public function productionQueue(): Collection
    {
        return Order::query()
            ->whereIn('status', ['menunggu_approval', 'diproses_produksi'])
            ->with('items')
            ->oldest()
            ->get();
    }

    /**
     * PATCH /admin/orders/{id}/status — FR-021. The only forward transition
     * Admin triggers directly: menunggu_approval -> diproses_produksi.
     */
    public function updateStatus(Order $order, User $admin): Order
    {
        return DB::transaction(function () use ($order, $admin) {
            $order = $this->lockOrder($order);

            if ($order->status !== 'menunggu_approval') {
                throw ValidationException::withMessages([
                    'status' => [__('messages.order.production_invalid_status')],
                ]);
            }

            $order->update(['status' => 'diproses_produksi', 'production_started_at' => now()]);
            $this->orders->recordStatusHistory($order, 'menunggu_approval', 'diproses_produksi', 'admin', $admin->id);
            $this->auditLog->record($admin, 'order.status_update', $order, 'diproses_produksi');

            return $order;
        });
    }

    /**
     * POST /admin/orders/{id}/reject — FR-043. Unlike every other reject
     * endpoint in this module (Creator/Design), 5.3_API_Specification.md §8
     * mandates 409 Conflict here (not 422) if the order's status already
     * moved on before the request was processed.
     */
    public function reject(Order $order, User $admin, string $reason): Order
    {
        return DB::transaction(function () use ($order, $admin, $reason) {
            $order = $this->lockOrder($order);

            if ($order->status !== 'menunggu_approval') {
                throw new ConflictHttpException(__('messages.order.reject_invalid_status'));
            }

            $order->update(['status' => 'ditolak', 'rejection_reason' => $reason]);
            $this->orders->recordStatusHistory($order, 'menunggu_approval', 'ditolak', 'admin', $admin->id, $reason);

            $this->notifications->notify(
                $order->user,
                'order.rejected',
                'Pesanan ditolak',
                "Pesanan {$order->order_number} ditolak: {$reason}",
                $order,
            );
            $this->auditLog->record($admin, 'order.reject', $order, $reason);

            return $order;
        });
    }

    /**
     * POST /admin/orders/{id}/shipment — FR-022. Only creates the Shipment
     * row (menunggu_pickup) and attempts a real Biteship booking when
     * credentials are configured — degrades to a booking-less row otherwise,
     * same pattern as PaymentService/Midtrans. Deliberately does NOT
     * transition order.status to "dikirim" here — that stays exclusively
     * webhook-driven (BiteshipWebhookService), since booking and "actually
     * shipped" are different moments.
     */
    /**
     * Split into two short transactions bookending the Biteship call rather
     * than one long one, so the row lock isn't held across an external HTTP
     * request — the second transaction re-checks shipment existence to catch
     * a request that raced past the first check while the booking call was
     * in flight.
     *
     * $courierCompany/$courierType default to whatever the customer picked
     * at checkout (stored on the order) — admin only needs to pass an
     * override if that courier turns out to be unavailable at booking time.
     */
    public function bookShipment(Order $order, User $admin, ?string $courierCompany = null, ?string $courierType = null): Shipment
    {
        $order = DB::transaction(function () use ($order) {
            $locked = $this->lockOrder($order);

            if ($locked->status !== 'diproses_produksi') {
                throw ValidationException::withMessages([
                    'status' => [__('messages.order.shipment_invalid_status')],
                ]);
            }

            if ($locked->shipment()->exists()) {
                throw ValidationException::withMessages([
                    'order' => [__('messages.order.shipment_already_exists')],
                ]);
            }

            return $locked;
        });

        $courierCompany ??= $order->courier_company;
        $courierType ??= $order->courier_type;

        $booking = blank(config('services.biteship.api_key'))
            ? ['biteship_order_id' => null, 'tracking_number' => null]
            : $this->biteship->createBooking($order, $courierCompany, $courierType);

        return DB::transaction(function () use ($order, $admin, $courierCompany, $courierType, $booking) {
            $locked = $this->lockOrder($order);

            if ($locked->shipment()->exists()) {
                throw ValidationException::withMessages([
                    'order' => [__('messages.order.shipment_already_exists')],
                ]);
            }

            $shipment = Shipment::create([
                'order_id' => $locked->id,
                'biteship_order_id' => $booking['biteship_order_id'],
                'tracking_number' => $booking['tracking_number'],
                'courier' => $courierCompany,
                'courier_type' => $courierType,
                'status' => 'menunggu_pickup',
            ]);
            $this->auditLog->record($admin, 'order.shipment_book', $locked, "courier: {$courierCompany} {$courierType}");

            return $shipment;
        });
    }
}
