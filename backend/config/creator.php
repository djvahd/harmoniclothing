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

];
