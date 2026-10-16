<?php

namespace App\Services;

use App\Models\Order;
use App\Repositories\OrderRepository;
use Illuminate\Support\Facades\DB;

/**
 * 2.3_User_Flow.md line 222: "Pembayaran Midtrans berhasil → status pesanan
 * otomatis jadi Menunggu Approval, invoice ter-generate." Handles the three
 * Midtrans transaction_status buckets (success/failure/pending).
 */
class MidtransWebhookService
{
    private const FAILURE_STATUSES = ['deny', 'cancel', 'expire'];

    public function __construct(
        private readonly OrderRepository $orders,
        private readonly InvoiceService $invoices,
        private readonly CommissionService $commissions,
        private readonly NotificationService $notifications,
    ) {}

    public function handle(array $payload): void
    {
        $order = Order::query()->where('order_number', $payload['order_id'])->first();

        if (! $order || ! $order->payment) {
            return; // nothing to reconcile — respond 200 regardless (idempotent)
        }

        $status = $payload['transaction_status'];
        $fraudStatus = $payload['fraud_status'] ?? null;

        DB::transaction(function () use ($order, $payload, $status, $fraudStatus) {
            if ($this->isSuccessful($status, $fraudStatus)) {
                $this->markPaid($order, $payload);
            } elseif ($this->isFailed($status, $fraudStatus)) {
                $order->payment->update(['status' => 'gagal', 'raw_response' => $payload]);
            } else {
                $order->payment->update(['raw_response' => $payload]); // pending / challenge
            }
        });
    }

    /**
     * settlement is always final. capture (card payments) additionally depends
     * on fraud_status — only 'accept' means the transaction actually cleared;
     * 'challenge' needs manual review and must not be treated as paid.
     */
    private function isSuccessful(string $status, ?string $fraudStatus): bool
    {
        if ($status === 'settlement') {
            return true;
        }

        return $status === 'capture' && $fraudStatus === 'accept';
    }

    private function isFailed(string $status, ?string $fraudStatus): bool
    {
        if (in_array($status, self::FAILURE_STATUSES, true)) {
            return true;
        }

        return $status === 'capture' && $fraudStatus === 'deny';
    }

    private function markPaid(Order $order, array $payload): void
    {
        $order->payment->update([
            'status' => 'berhasil',
            'midtrans_transaction_id' => $payload['transaction_id'] ?? null,
            'method' => $payload['payment_type'] ?? null,
            'paid_at' => now(),
            'raw_response' => $payload,
        ]);

        if ($order->status === 'belum_dibayar') {
            $order->update(['status' => 'menunggu_approval', 'paid_at' => now()]);
            $this->orders->recordStatusHistory($order, 'belum_dibayar', 'menunggu_approval', 'system');
            $this->invoices->generateFor($order);

            // BR-007: commission generated automatically per paid transaction
            // involving a Creator's design (order_items with a design_id).
            $order->items->each(fn ($item) => $this->commissions->generateForOrderItem($item));

            $this->notifications->notify(
                $order->user,
                'order.paid',
                'Pembayaran berhasil',
                "Pesanan {$order->order_number} telah dibayar dan menunggu approval Admin.",
                $order,
                ['order' => $order->order_number],
            );
        }
    }
}
