<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
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

        // Same reasoning as ResetPassword above, but the signature is tied to
        // the exact URL it was generated for — so this still builds Laravel's
        // normal signed API URL, then re-points it at the Next.js /verify-email
        // page carrying the same id/hash/expires/signature. That page calls
        // the API with those same params, so URL::hasValidSignature() in
        // AuthController::verifyEmail() still validates correctly.
        VerifyEmail::createUrlUsing(function ($notifiable) {
            $signed = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(config('auth.verification.expire', 60)),
                ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())]
            );

            $query = parse_url($signed, PHP_URL_QUERY);

            return sprintf(
                '%s/verify-email?id=%s&hash=%s&%s',
                rtrim(config('app.frontend_url'), '/'),
                $notifiable->getKey(),
                sha1($notifiable->getEmailForVerification()),
                $query
            );
        });

        // Laravel's default VerifyEmail/ResetPassword mail content is
        // hardcoded English — this is an id-first app (APP_LOCALE=id), so
        // override with the app's own translated strings instead.
        VerifyEmail::toMailUsing(fn ($notifiable, string $url) => (new MailMessage)
            ->subject(__('messages.auth.mail.verify_subject'))
            ->line(__('messages.auth.mail.verify_line1'))
            ->action(__('messages.auth.mail.verify_action'), $url)
            ->line(__('messages.auth.mail.verify_line2')));

        // NB: unlike VerifyEmail, ResetPassword::toMailUsing() receives the raw
        // TOKEN as its second argument, not a URL (createUrlUsing() above is
        // not applied on this path) - so the link is built here. Passing the
        // token straight to action() made the button point at the bare token.
        ResetPassword::toMailUsing(function ($notifiable, string $token) {
            $url = sprintf(
                '%s/reset-password?token=%s&email=%s',
                rtrim(config('app.frontend_url'), '/'),
                $token,
                urlencode($notifiable->getEmailForPasswordReset())
            );

            return (new MailMessage)
                ->subject(__('messages.auth.mail.reset_subject'))
                ->line(__('messages.auth.mail.reset_line1'))
                ->action(__('messages.auth.mail.reset_action'), $url)
                ->line(__('messages.auth.mail.reset_line2', [
                    'count' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire'),
                ]))
                ->line(__('messages.auth.mail.reset_line3'));
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
