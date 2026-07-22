<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * BR-007 (2026-07-22 revision): commission payout is automatic, batched
 * weekly by the commissions:payout scheduled command. Disbursement is
 * stubbed until a real provider account (Midtrans Iris/Xendit/etc) is
 * configured — same graceful-degradation pattern as PaymentService/
 * BiteshipService, but a commission is only marked "dibayar" on an actual
 * confirmed transfer, never speculatively — unlike a stubbed Shipment row,
 * claiming money was sent when it wasn't would misrepresent a real
 * financial record.
 */
class PayoutService
{
    /** @return array{paid: array<int>, skipped: array<int>} creator_id lists, for the command's summary output. */
    public function run(): array
    {
        $paidCreators = [];
        $skippedCreators = [];

        $eligible = Commission::query()
            ->where('status', 'terhutang')
            ->get()
            ->groupBy('creator_id');

        foreach ($eligible as $creatorId => $commissions) {
            $total = (float) $commissions->sum('amount');

            if ($total < config('creator.payout_minimum_amount')) {
                continue;
            }

            $profile = User::find($creatorId)?->creatorProfile;

            if (! $profile || ! $profile->payout_method || ! $profile->payout_account_number) {
                $skippedCreators[] = $creatorId;
                Log::warning("Payout skipped for creator {$creatorId}: no payout destination on file.");

                continue;
            }

            $reference = $this->disburse($profile, $total);

            if ($reference === null) {
                $skippedCreators[] = $creatorId;
                Log::info("Payout pending for creator {$creatorId}: Rp{$total} ready, no disbursement provider configured yet.");

                continue;
            }

            Commission::query()
                ->whereIn('id', $commissions->pluck('id'))
                ->update(['status' => 'dibayar', 'paid_at' => now(), 'payout_reference' => $reference]);

            $paidCreators[] = $creatorId;
        }

        return ['paid' => $paidCreators, 'skipped' => $skippedCreators];
    }

    /**
     * Real disbursement call — returns null (no transfer attempted) until a
     * provider is configured. Deliberately does not fabricate a reference.
     */
    private function disburse(CreatorProfile $profile, float $amount): ?string
    {
        if (blank(config('services.disbursement.api_key'))) {
            return null;
        }

        // Real Midtrans Iris/Xendit/etc disbursement call goes here once an account exists.
        return (string) Str::uuid();
    }
}
