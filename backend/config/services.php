<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'midtrans' => [
        'server_key' => env('MIDTRANS_SERVER_KEY'),
        'client_key' => env('MIDTRANS_CLIENT_KEY'),
        'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
        // Methods the customer can pick at checkout (GET /checkout/payment-methods).
        // `snap` is the Midtrans enabled_payments value(s) the choice maps to; every channel
        // must also be switched on in the Midtrans dashboard or Snap will not show it.
        // The first entry is the checkout default.
        'payment_methods' => [
            'bca_va' => ['label' => 'BCA Virtual Account', 'group' => 'virtual_account', 'snap' => ['bca_va']],
            'bni_va' => ['label' => 'BNI Virtual Account', 'group' => 'virtual_account', 'snap' => ['bni_va']],
            'bri_va' => ['label' => 'BRI Virtual Account', 'group' => 'virtual_account', 'snap' => ['bri_va']],
            'mandiri_va' => ['label' => 'Mandiri Virtual Account', 'group' => 'virtual_account', 'snap' => ['echannel']],
            'permata_va' => ['label' => 'Permata Virtual Account', 'group' => 'virtual_account', 'snap' => ['permata_va']],
            'qris' => ['label' => 'QRIS', 'group' => 'ewallet', 'snap' => ['qris']],
            'gopay' => ['label' => 'GoPay', 'group' => 'ewallet', 'snap' => ['gopay']],
            'shopeepay' => ['label' => 'ShopeePay', 'group' => 'ewallet', 'snap' => ['shopeepay']],
            'alfamart' => ['label' => 'Alfamart', 'group' => 'store', 'snap' => ['alfamart']],
            'indomaret' => ['label' => 'Indomaret', 'group' => 'store', 'snap' => ['indomaret']],
        ],
    ],

    'biteship' => [
        'api_key' => env('BITESHIP_API_KEY'),
        'webhook_token' => env('BITESHIP_WEBHOOK_TOKEN'),

        // Single fixed production/warehouse origin (Harmoni is not
        // multi-warehouse/dropship) — used as `origin_*` on every rate-check
        // and booking call.
        'origin_name' => env('BITESHIP_ORIGIN_NAME', 'Harmoni Clothing'),
        'origin_phone' => env('BITESHIP_ORIGIN_PHONE'),
        'origin_address' => env('BITESHIP_ORIGIN_ADDRESS'),
        'origin_postal_code' => env('BITESHIP_ORIGIN_POSTAL_CODE'),

        // v1 simplification: flat weight per item rather than a real
        // per-variant weight (no `weight` column on product_variants yet).
        // Revisit if rate accuracy for heavy items (hoodies, jackets) matters.
        'item_weight_grams' => (int) env('BITESHIP_ITEM_WEIGHT_GRAMS', 250),

        // Couriers offered at checkout rate-check time — comma-separated,
        // passed straight through to Biteship's `couriers` param.
        'couriers' => env('BITESHIP_COURIERS', 'jne,jnt,sicepat'),

        // Service types per courier, for the admin "Ganti Kurir" dropdown and
        // its validation. Companies not listed here have no selectable type.
        'courier_types' => [
            'jne' => ['reg', 'yes', 'oke'],
            'jnt' => ['ez'],
            'sicepat' => ['reg', 'best', 'halu'],
        ],
    ],

    // BR-007 (2026-07-22): automatic commission payout. No account signed up
    // yet — PayoutService degrades gracefully (no api_key = no real transfer
    // attempted) until a real disbursement provider (Midtrans Iris/Xendit/etc) is chosen.
    'disbursement' => [
        'api_key' => env('DISBURSEMENT_API_KEY'),
    ],

];
