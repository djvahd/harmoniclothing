<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// BR-017: 24h window is coarse, hourly checks are frequent enough.
Schedule::command('orders:cancel-unpaid')->hourly();
