<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

/**
 * BR-007 (revised 2026-10-16): commission payout is MANUAL. Admin sees what each
 * creator is owed, transfers the money outside the app (bank/e-wallet), then
 * records the transfer reference here. A commission is only marked "dibayar" by
 * that explicit admin action, never automatically.
 */
class PayoutService
{
    public function __construct(
        private readonly NotificationService $notifications,
        private readonly AuditLogService $auditLog,
    ) {}

    /** One row per creator that has unpaid ("terhutang") commissions. */
    public function summary(): Collection
    {
        $minimum = (float) config('business.creator_payout_minimum');

        return Commission::query()
            ->where('status', 'terhutang')
            ->get()
            ->groupBy('creator_id')
            ->map(function (Collection $commissions, int|string $creatorId) use ($minimum) {
                $user = User::with('creatorProfile')->find($creatorId);
                $profile = $user?->creatorProfile;
                $total = (float) $commissions->sum('amount');

                return [
                    'creator_id' => (int) $creatorId,
                    'name' => $user?->name,
                    'brand_name' => $profile?->brand_name,
                    'payout_method' => $profile?->payout_method,
                    'payout_account_number' => $profile?->payout_account_number,
                    'payout_account_holder' => $profile?->payout_account_holder,
                    'commission_count' => $commissions->count(),
                    'total_owed' => number_format($total, 2, '.', ''),
                    'meets_minimum' => $total >= $minimum,
                    'has_destination' => (bool) ($profile?->payout_method && $profile?->payout_account_number),
                ];
            })
            ->sortByDesc(fn (array $row) => (float) $row['total_owed'])
            ->values();
    }

    /**
     * Marks every unpaid commission of one creator as paid with the admin's transfer reference.
     *
     * @return array{count: int, total: string}
     */
    public function markPaid(int $creatorId, string $reference, User $admin): array
    {
        $commissions = Commission::query()->where('creator_id', $creatorId)->where('status', 'terhutang')->get();
        $total = (float) $commissions->sum('amount');

        if ($commissions->isEmpty()) {
            throw ValidationException::withMessages(['creator' => [__('messages.payout.nothing_owed')]]);
        }

        if ($total < (float) config('business.creator_payout_minimum')) {
            throw ValidationException::withMessages(['creator' => [__('messages.payout.below_minimum')]]);
        }

        $profile = User::find($creatorId)?->creatorProfile;

        if (! $profile?->payout_method || ! $profile->payout_account_number) {
            throw ValidationException::withMessages(['creator' => [__('messages.payout.no_destination')]]);
        }

        Commission::query()
            ->whereIn('id', $commissions->pluck('id'))
            ->update(['status' => 'dibayar', 'paid_at' => now(), 'payout_reference' => $reference]);

        $formatted = number_format($total, 0, ',', '.');
        $this->notifications->notify(
            $profile->user,
            'payout.paid',
            'Komisi dicairkan',
            "Komisi Rp {$formatted} telah ditransfer ke rekening Anda (ref: {$reference}).",
            $profile,
            ['amount' => $formatted, 'reference' => $reference],
        );
        $this->auditLog->record($admin, 'payout.paid', $profile, "Rp {$formatted}, ref: {$reference}");

        return ['count' => $commissions->count(), 'total' => number_format($total, 2, '.', '')];
    }
}
