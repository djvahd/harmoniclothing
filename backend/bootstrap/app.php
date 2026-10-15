<?php

use App\Http\Middleware\EnsureCreatorIsActive;
use App\Http\Middleware\EnsureSessionIsCurrent;
use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\SetLocaleFromRequest;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Exceptions\InvalidSignatureException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->api(prepend: [SetLocaleFromRequest::class]);
        $middleware->alias([
            'creator.active' => EnsureCreatorIsActive::class,
            'user.active' => EnsureUserIsActive::class,
            // Ends every session whose stored password hash no longer matches
            // (e.g. after a password reset), so a stolen session cannot outlive it.
            'auth.session' => EnsureSessionIsCurrent::class,
            // Not parameterized like throttle:60,1 — this only ever checks
            // for Admin, so the alias is a plain name, not "role:admin".
            'admin' => EnsureUserIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // The framework's own messages for these two are hard-coded English
        // ("Too Many Attempts.", "Invalid signature."); render them localized.
        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => __('messages.http.too_many_requests')], 429, $e->getHeaders());
            }
        });
        $exceptions->render(function (InvalidSignatureException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => __('messages.http.invalid_signature')], 403);
            }
        });
    })->create();
