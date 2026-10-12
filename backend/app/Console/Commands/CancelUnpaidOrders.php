<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Repositories\OrderRepository;
use App\Services\NotificationService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/** BR-017: auto-cancel orders unpaid 24h after checkout (Midtrans transaction validity window). */
#[Signature('orders:cancel-unpaid')]
#[Description('Cancel orders still belum_dibayar 24h after checkout (BR-017)')]
class CancelUnpaidOrders extends Command
{
    public function handle(OrderRepository $orders, NotificationService $notifications): int
    {
        $stale = Order::query()
            ->where('status', 'belum_dibayar')
            ->where('created_at', '<', now()->subHours(config('business.unpaid_order_cancel_hours')))
            ->get();

        foreach ($stale as $order) {
            $order->update(['status' => 'dibatalkan', 'cancelled_at' => now(), 'cancelled_by' => 'system']);
            $orders->recordStatusHistory($order, 'belum_dibayar', 'dibatalkan', 'system', reason: 'Auto-cancelled: unpaid 24 hours after checkout.');
            $notifications->notify(
                $order->user,
                'order.auto_cancelled',
                'Pesanan dibatalkan',
                "Pesanan {$order->order_number} dibatalkan otomatis karena belum dibayar dalam 24 jam.",
                $order,
            );
        }

        $this->info("Cancelled {$stale->count()} unpaid order(s).");

        return self::SUCCESS;
    }
}
