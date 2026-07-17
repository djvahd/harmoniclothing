<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(private readonly UserRepository $users)
    {
    }

    /**
     * FR-001 / NFR-012: role & status are never mass-assigned from the
     * request — every self-registered account is customer/aktif by default
     * (DB column defaults), admin only via manual provisioning (4.3 note).
     */
    public function register(array $data): User
    {
        return $this->users->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'privacy_accepted_at' => now(),
            'terms_accepted_at' => now(),
        ]);
    }

    /**
     * 5.3_API_Specification.md POST /auth/login: generic error message,
     * doesn't distinguish "email not found" vs "wrong password" (prevents
     * user enumeration).
     */
    public function attemptLogin(array $credentials): User
    {
        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        return $user;
    }

    public function logout(): void
    {
        Auth::guard('web')->logout();
    }
}
