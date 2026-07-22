<?php

namespace App\Console\Commands;

use App\Services\PayoutService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/** BR-007 (2026-07-22 revision): pay out eligible creator commissions weekly. */
#[Signature('commissions:payout')]
#[Description('Pay out creator commissions above the minimum threshold (BR-007)')]
class RunCreatorPayouts extends Command
{
    public function handle(PayoutService $payouts): int
    {
        $result = $payouts->run();

        $this->info(count($result['paid']).' creator(s) paid, '.count($result['skipped']).' skipped (below minimum or no destination/provider).');

        return self::SUCCESS;
    }
}
