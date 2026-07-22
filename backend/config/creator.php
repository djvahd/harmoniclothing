<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Creator Commission Rate
    |--------------------------------------------------------------------------
    |
    | BR-007: commission is calculated automatically per transaction. No
    | percentage is specified anywhere in the project's planning docs
    | (Business Rules, Table Design, Project Brief) — this 20% default is a
    | placeholder matching the competitor-research reference point for
    | Redbubble's default artist margin, NOT a real business decision. Set
    | CREATOR_COMMISSION_RATE before launch.
    |
    */

    'commission_rate' => (float) env('CREATOR_COMMISSION_RATE', 0.20),

    /*
    |--------------------------------------------------------------------------
    | Creator Payout Minimum
    |--------------------------------------------------------------------------
    |
    | BR-007 (2026-07-22 revision): commission payout is now automatic,
    | batched weekly. A creator's total outstanding ("terhutang") commission
    | must reach this amount before the weekly job pays it out — avoids
    | disbursing tiny amounts every week. Not specified in any planning doc;
    | a placeholder default, adjust via CREATOR_PAYOUT_MINIMUM before launch.
    |
    */

    'payout_minimum_amount' => (float) env('CREATOR_PAYOUT_MINIMUM', 50000),

];
