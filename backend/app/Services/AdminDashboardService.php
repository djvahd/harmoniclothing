<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\CreatorProfile;
use App\Models\Design;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;

/** GET /admin/dashboard — FE-042: top-level summary stats for the Admin landing page. */
class AdminDashboardService
{
    public function summary(): array
    {
        return [
            'users' => [
                'customers_total' => User::query()->where('role', UserRole::Customer)->count(),
                'creators_active' => CreatorProfile::query()->where('status', 'aktif')->count(),
                'creators_pending' => CreatorProfile::query()->where('status', 'menunggu_approval')->count(),
            ],
            'designs' => [
                'pending' => Design::query()->where('status', 'menunggu_approval')->count(),
            ],
            'orders' => [
                'menunggu_approval' => Order::query()->where('status', 'menunggu_approval')->count(),
                'diproses_produksi' => Order::query()->where('status', 'diproses_produksi')->count(),
                'dikirim' => Order::query()->where('status', 'dikirim')->count(),
                'selesai' => Order::query()->where('status', 'selesai')->count(),
            ],
            'revenue' => [
                // Builder::sum() bypasses the Payment model's decimal cast — format explicitly.
                // Net revenue, same rule as SalesReportService: rejected/cancelled orders are refunded.
                'total' => number_format((float) Payment::query()
                    ->where('status', 'berhasil')
                    ->whereHas('order', fn ($q) => $q->whereNotIn('status', ['ditolak', 'dibatalkan']))
                    ->sum('amount'), 2, '.', ''),
            ],
        ];
    }
}
