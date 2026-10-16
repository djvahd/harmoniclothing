<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\Shipment;
use App\Models\User;
use App\Repositories\OrderRepository;
use Illuminate\Support\Facades\DB;

/**
 * FE-035 auto tracking. Payload field names and the 14-value status enum
 * verified against Biteship's official webhook docs (biteship.com/en/docs/
 * api/webhook/overview, biteship.com/en/docs/api/trackings/status) on
 * 2026-09-08 — the field names here (courier_waybill_id, courier_company)
 * are not the same as Biteship's Order API response fields, don't conflate
 * the two.
 *
 * BR-014: order status mirrors shipment status — "dikirim" moves the order
 * to "dikirim", "delivered" moves it to "menunggu_konfirmasi" (starting the
 * 3-business-day auto-complete window). A "bermasalah" shipment status does
 * NOT change order.status — that stays whatever it was, admin resolves
 * manually (notified below).
 */
class BiteshipWebhookService
{
    /** Biteship's 14 possible `status` values, collapsed to this app's 4. */
    private const STATUS_MAP = [
        'confirmed' => 'menunggu_pickup',
        'allocated' => 'menunggu_pickup',
        'pickingUp' => 'menunggu_pickup',
        'picked' => 'menunggu_pickup',
        'inTransit' => 'dikirim',
        'droppingOff' => 'dikirim',
        'delivered' => 'delivered',
        'returnInTransit' => 'bermasalah',
        'onHold' => 'bermasalah',
        'rejected' => 'bermasalah',
        'courierNotFound' => 'bermasalah',
        'returned' => 'bermasalah',
        'cancelled' => 'bermasalah',
        'disposed' => 'bermasalah',
    ];

    public function __construct(
        private readonly OrderRepository $orders,
        private readonly NotificationService $notifications,
    ) {}

    public function handle(array $payload): void
    {
        // Biteship's install-time verification ping POSTs an empty body and requires a 200,
        // so a payload without an order id is ignored rather than treated as an error.
        if (blank($payload['order_id'] ?? null)) {
            return;
        }

        $shipment = Shipment::query()->where('biteship_order_id', $payload['order_id'])->first();

        if (! $shipment) {
            return; // nothing to reconcile — respond 200 regardless (idempotent)
        }

        $biteshipStatus = $payload['status'] ?? null;
        $status = self::STATUS_MAP[$biteshipStatus] ?? null;

        if ($status === null) {
            return; // unrecognized status — ignore rather than guess, respond 200 regardless
        }

        DB::transaction(function () use ($shipment, $payload, $status, $biteshipStatus) {
            $wasAlreadyProblem = $shipment->status === 'bermasalah';

            $shipment->update([
                'tracking_number' => $payload['courier_waybill_id'] ?? $shipment->tracking_number,
                'courier' => $payload['courier_company'] ?? $shipment->courier,
                'status' => $status,
                'shipped_at' => $status === 'dikirim' ? ($shipment->shipped_at ?? now()) : $shipment->shipped_at,
                'delivered_at' => $status === 'delivered' ? now() : $shipment->delivered_at,
            ]);

            $order = $shipment->order;

            if ($status === 'dikirim' && $order->status === 'diproses_produksi') {
                $order->update(['status' => 'dikirim']);
                $this->orders->recordStatusHistory($order, 'diproses_produksi', 'dikirim', 'system');
                $this->notifications->notify(
                    $order->user,
                    'order.shipped',
                    'Pesanan dikirim',
                    "Pesanan {$order->order_number} sedang dalam perjalanan.",
                    $order,
                    ['order' => $order->order_number],
                );
            } elseif ($status === 'delivered' && $order->status === 'dikirim') {
                $order->update(['status' => 'menunggu_konfirmasi']);
                $this->orders->recordStatusHistory($order, 'dikirim', 'menunggu_konfirmasi', 'system');
                $this->notifications->notify(
                    $order->user,
                    'order.delivered',
                    'Pesanan sampai',
                    "Pesanan {$order->order_number} telah sampai. Konfirmasi penerimaan sekarang.",
                    $order,
                    ['order' => $order->order_number],
                );
            } elseif ($status === 'bermasalah' && ! $wasAlreadyProblem) {
                $this->notifyAdmins($order, $biteshipStatus);
            }
        });
    }

    /** Admin-facing alert — no dedicated "shipment problem" admin dashboard yet, notification is the whole feature for now. */
    private function notifyAdmins(Order $order, string $biteshipStatus): void
    {
        User::query()->where('role', UserRole::Admin)->get()->each(
            fn (User $admin) => $this->notifications->notify(
                $admin,
                'shipment.problem',
                'Pengiriman bermasalah',
                "Pengiriman pesanan {$order->order_number} bermasalah: {$biteshipStatus}. Perlu dicek manual.",
                $order,
                ['order' => $order->order_number, 'status' => $biteshipStatus],
            )
        );
    }
}
