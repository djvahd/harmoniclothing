<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Support\Carbon;

/** GET /admin/reports/sales — FR-033: omzet, produk terlaris, statistik operasional. */
class SalesReportService
{
    public function generate(?string $from, ?string $to): array
    {
        $from = $from ? Carbon::parse($from)->startOfDay() : now()->subDays(30)->startOfDay();
        $to = $to ? Carbon::parse($to)->endOfDay() : now()->endOfDay();

        $paidPayments = Payment::query()->where('status', 'berhasil')->whereBetween('paid_at', [$from, $to]);
        $revenueTotal = (float) (clone $paidPayments)->sum('amount');
        $paidCount = (clone $paidPayments)->count();

        $ordersInRange = Order::query()->whereBetween('created_at', [$from, $to]);

        return [
            'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'revenue' => [
                'total' => number_format($revenueTotal, 2, '.', ''),
                'average_order_value' => number_format($paidCount > 0 ? $revenueTotal / $paidCount : 0, 2, '.', ''),
            ],
            'orders' => [
                'total' => (clone $ordersInRange)->count(),
                'by_status' => (clone $ordersInRange)
                    ->selectRaw('status, count(*) as count')
                    ->groupBy('status')
                    ->pluck('count', 'status'),
            ],
            'top_products' => $this->topProducts($from, $to),
        ];
    }

    private function topProducts(Carbon $from, Carbon $to): array
    {
        return OrderItem::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_variants', 'order_items.product_variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->whereBetween('orders.created_at', [$from, $to])
            ->selectRaw('products.id as product_id, products.name_id, SUM(order_items.quantity) as quantity_sold, SUM(order_items.subtotal) as revenue')
            ->groupBy('products.id', 'products.name_id')
            ->orderByDesc('quantity_sold')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'product_id' => $row->product_id,
                'name' => $row->name_id,
                'quantity_sold' => (int) $row->quantity_sold,
                'revenue' => number_format((float) $row->revenue, 2, '.', ''),
            ])
            ->all();
    }
}
