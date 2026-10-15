<?php

namespace App\Services;

use App\Enums\UserStatus;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(private readonly UserRepository $users) {}

    /**
     * FR-001 / NFR-012: role & status are never mass-assigned from the
     * request — every self-registered account is customer/aktif by default
     * (DB column defaults), admin only via manual provisioning (4.3 note).
     */
    public function register(array $data): User
    {
        $user = $this->users->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'privacy_accepted_at' => now(),
            'terms_accepted_at' => now(),
        ]);

        event(new Registered($user));

        return $user;
    }

    /**
     * 5.3_API_Specification.md POST /auth/login: generic error message,
     * doesn't distinguish "email not found" vs "wrong password" (prevents
     * user enumeration). Unverified email is a distinct, explicit rejection
     * (1.2_Requirement_Gathering.md line 218) — revealing it isn't an
     * enumeration risk since it's only shown after the password already
     * matched.
     */
    public function attemptLogin(array $credentials): User
    {
        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => [__('messages.auth.invalid_credentials')],
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        if ($user->status === UserStatus::Banned) {
            Auth::guard('web')->logout();

            throw ValidationException::withMessages([
                'email' => [__('messages.auth.account_banned')],
            ]);
        }

        if (! $user->hasVerifiedEmail()) {
            Auth::guard('web')->logout();

            throw ValidationException::withMessages([
                'email' => [__('messages.auth.email_not_verified')],
            ]);
        }

        return $user;
    }

    public function logout(): void
    {
        Auth::guard('web')->logout();
    }

    /**
     * POST /auth/verify-email/resend — not enumerated in 5.2_API_List.md but
     * required by the "kirim ulang verifikasi" option in the login user flow
     * (1.2_Requirement_Gathering.md line 218). Silent no-op for unknown/
     * already-verified emails — same enumeration-safe shape as forgot-password.
     */
    public function resendVerification(string $email): void
    {
        $user = $this->users->findByEmail($email);

        if ($user && ! $user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
        }
    }
}
