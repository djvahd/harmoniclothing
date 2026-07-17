<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 1.2_Requirement_Gathering.md line 218: register sends the
        // verification email that gates login until confirmed.
        Event::listen(Registered::class, SendEmailVerificationNotification::class);

        // 5.4_Authentication_Flow.md §Password Reset: link points at the
        // Next.js /reset-password page, not a Laravel named route (this is
        // an API-only backend — the default `route('password.reset', ...)`
        // would throw RouteNotFoundException since that route doesn't exist).
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            return sprintf(
                '%s/reset-password?token=%s&email=%s',
                rtrim(config('app.frontend_url'), '/'),
                $token,
                urlencode($notifiable->getEmailForPasswordReset())
            );
        });

        // 5.6_Security_Planning.md §7: 5 attempts/min/IP+email, then cooldown.
        RateLimiter::for('login', function (Request $request) {
            $throttleKey = strtolower((string) $request->input('email')).'|'.$request->ip();

            return Limit::perMinute(5)->by($throttleKey);
        });

        // 5.6_Security_Planning.md §7: 20 req/min/IP for all /auth/* endpoints.
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(20)->by($request->ip());
        });
    }
}
