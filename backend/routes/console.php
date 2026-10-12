<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// BR-017: 24h window is coarse, hourly checks are frequent enough.
Schedule::command('orders:cancel-unpaid')->hourly();

// BR-014: 3 business-day window, hourly checks are frequent enough.
Schedule::command('orders:auto-complete-deliveries')->hourly();

// BR-007 (2026-07-22 revision): automatic weekly creator commission payout.
Schedule::command('commissions:payout')->weekly();
