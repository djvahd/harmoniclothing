<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/**
 * 1.2_Requirement_Gathering.md line 218 + 5.2_API_List.md §2.
 */
class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_sends_verification_notification(): void
    {
        Notification::fake();

        $this->postJson('/api/auth/register', [
            'name' => 'Budi',
            'email' => 'budi@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'privacy_accepted' => true,
            'terms_accepted' => true,
        ])->assertCreated();

        $user = User::where('email', 'budi@example.com')->firstOrFail();
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_login_is_rejected_when_email_unverified(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertStatus(422);
        $this->assertGuest();
    }

    public function test_login_succeeds_when_email_verified(): void
    {
        $user = User::factory()->create();

        // Sanctum SPA mode only starts a session for requests it recognizes
        // as coming from a stateful frontend (matched by Origin), same as
        // the curl testing note in AuthService's PHPDoc history.
        $this->withHeader('Origin', 'http://localhost:3000')
            ->postJson('/api/auth/login', [
                'email' => $user->email,
                'password' => 'password',
            ])->assertOk();

        $this->assertAuthenticatedAs($user);
    }

    public function test_verify_email_marks_user_verified_with_valid_signature(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $this->getJson($url)->assertOk();

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_verify_email_rejects_invalid_hash(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1('wrong@example.com')]
        );

        $this->getJson($url)->assertForbidden();
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_verify_email_rejects_expired_signature(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->subMinutes(1),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $this->getJson($url)->assertForbidden();
    }

    public function test_resend_verification_is_generic_for_unknown_email(): void
    {
        Notification::fake();

        $this->postJson('/api/auth/verify-email/resend', [
            'email' => 'nobody@example.com',
        ])->assertOk();

        Notification::assertNothingSent();
    }

    public function test_resend_verification_sends_for_unverified_known_email(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();

        $this->postJson('/api/auth/verify-email/resend', [
            'email' => $user->email,
        ])->assertOk();

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    /**
     * The default VerifyEmail link points straight at this API-only backend's
     * JSON route, which dumps raw JSON in the browser instead of a page — and
     * its default mail content is hardcoded English despite APP_LOCALE=id.
     * AppServiceProvider overrides both; this locks in that the override
     * still applies to whatever notification actually gets sent.
     */
    public function test_verification_email_points_to_frontend_and_is_localized(): void
    {
        Notification::fake();
        config(['app.frontend_url' => 'http://localhost:3000']);
        app()->setLocale('id');

        $user = User::factory()->unverified()->create();
        $user->sendEmailVerificationNotification();

        Notification::assertSentTo($user, VerifyEmail::class, function (VerifyEmail $notification) use ($user) {
            $mail = $notification->toMail($user);

            return str_starts_with($mail->actionUrl, 'http://localhost:3000/verify-email?id=')
                && $mail->subject === 'Verifikasi Alamat Email Anda';
        });
    }
}
