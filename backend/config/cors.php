<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],
    'allowed_methods' => ['*'],
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')),
    // The frontend dev server auto-picks a different port when 3000 is
    // already taken (e.g. by another local session), so allow any
    // localhost port in addition to the fixed origin above.
    'allowed_origins_patterns' => ['#^http://localhost:\d+$#'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,

    // Required for Sanctum SPA cookie auth (5.4_Authentication_Flow.md).
    'supports_credentials' => true,
];
