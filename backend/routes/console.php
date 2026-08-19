<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Mailtrap\Helper\ResponseHelper;
use Mailtrap\MailtrapClient;
use Mailtrap\Mime\MailtrapEmail;
use Symfony\Component\Mime\Address;

// Temporary — one-off connectivity check for the Mailtrap Email Sending API
// token, per Mailtrap's own onboarding instructions. Not the app's real mail
// path (Notifications still go through MAIL_MAILER); safe to delete once the
// token is confirmed working.
Artisan::command('send-mail', function () {
    $token = env('MAILTRAP_API_TOKEN');

    if (blank($token)) {
        $this->error('MAILTRAP_API_TOKEN is not set in .env.');

        return 1;
    }

    $email = (new MailtrapEmail())
        ->from(new Address('hello@demomailtrap.co', 'Mailtrap Test'))
        ->to(new Address('harmoniclot@gmail.com'))
        ->subject('You are awesome!')
        ->category('Integration Test')
        ->text('Congrats for sending test email with Mailtrap!');

    $response = MailtrapClient::initSendingEmails(apiKey: $token)->send($email);

    $this->info(json_encode(ResponseHelper::toArray($response)));
})->purpose('Send a Mailtrap test email');

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// BR-017: 24h window is coarse, hourly checks are frequent enough.
Schedule::command('orders:cancel-unpaid')->hourly();

// BR-014: 3 business-day window, hourly checks are frequent enough.
Schedule::command('orders:auto-complete-deliveries')->hourly();

// BR-007 (2026-07-22 revision): automatic weekly creator commission payout.
Schedule::command('commissions:payout')->weekly();
