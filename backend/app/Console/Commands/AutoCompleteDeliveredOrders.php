<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Repositories\OrderRepository;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/**
 * BR-014: auto-complete orders 3 *business* days after "Delivered" if the
 * customer never confirms manually.
 */
#[Signature('orders:auto-complete-deliveries')]
#[Description('Auto-complete orders 3 business days after delivery without customer confirmation (BR-014)')]
class AutoCompleteDeliveredOrders extends Command
{
    public function handle(OrderRepository $orders, NotificationService $notifications): int
    {
        $completed = 0;

        Order::query()
            ->where('status', 'menunggu_konfirmasi')
            ->whereHas('shipment', fn ($query) => $query->whereNotNull('delivered_at'))
            ->with('shipment')
            ->get()
            ->each(function (Order $order) use ($orders, $notifications, &$completed) {
                if (now()->lessThan($this->addBusinessDays($order->shipment->delivered_at, 3))) {
                    return;
                }

                $order->update(['status' => 'selesai', 'completed_at' => now()]);
                $orders->recordStatusHistory($order, 'menunggu_konfirmasi', 'selesai', 'system');
                $notifications->notify(
                    $order->user,
                    'order.auto_completed',
                    'Pesanan selesai',
                    "Pesanan {$order->order_number} otomatis diselesaikan. Anda tetap dapat memberi rating lewat Riwayat Pesanan.",
                    $order,
                );
                $completed++;
            });

        $this->info("Auto-completed {$completed} order(s).");

        return self::SUCCESS;
    }

    private function addBusinessDays(Carbon $date, int $days): Carbon
    {
        $result = $date->copy();

        while ($days > 0) {
            $result->addDay();
            if (! $result->isWeekend()) {
                $days--;
            }
        }

        return $result;
    }
}
