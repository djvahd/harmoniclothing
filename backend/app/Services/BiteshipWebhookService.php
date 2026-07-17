<?php

namespace App\Services;

use App\Models\Shipment;
use App\Repositories\OrderRepository;
use Illuminate\Support\Facades\DB;

/**
 * FE-035 auto tracking. Biteship's exact webhook schema isn't in the specs
 * available here (unlike Midtrans's documented signature formula) — this
 * assumes the sender normalizes status to one of shipments.status's three
 * values directly (menunggu_pickup/dikirim/delivered); adjust the mapping
 * once a real Biteship account/webhook payload is available.
 *
 * BR-014: order status mirrors shipment status — "dikirim" moves the order
 * to "dikirim", "delivered" moves it to "menunggu_konfirmasi" (starting the
 * 3-business-day auto-complete window).
 */
class BiteshipWebhookService
{
    public function __construct(private readonly OrderRepository $orders) {}

    public function handle(array $payload): void
    {
        $shipment = Shipment::query()->where('biteship_order_id', $payload['order_id'])->first();

        if (! $shipment) {
            return; // nothing to reconcile — respond 200 regardless (idempotent)
        }

        $status = $payload['status'];

        DB::transaction(function () use ($shipment, $payload, $status) {
            $shipment->update([
                'tracking_number' => $payload['waybill_id'] ?? $shipment->tracking_number,
                'courier' => $payload['courier'] ?? $shipment->courier,
                'status' => $status,
                'shipped_at' => $status === 'dikirim' ? ($shipment->shipped_at ?? now()) : $shipment->shipped_at,
                'delivered_at' => $status === 'delivered' ? now() : $shipment->delivered_at,
            ]);

            $order = $shipment->order;

            if ($status === 'dikirim' && $order->status === 'diproses_produksi') {
                $order->update(['status' => 'dikirim']);
                $this->orders->recordStatusHistory($order, 'diproses_produksi', 'dikirim', 'system');
            } elseif ($status === 'delivered' && $order->status === 'dikirim') {
                $order->update(['status' => 'menunggu_konfirmasi']);
                $this->orders->recordStatusHistory($order, 'dikirim', 'menunggu_konfirmasi', 'system');
            }
        });
    }
}
