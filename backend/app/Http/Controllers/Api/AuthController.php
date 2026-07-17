<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $auth) {}

    /** POST /auth/register — 5.3_API_Specification.md */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->auth->register($request->validated());

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ], 201);
    }

    /** POST /auth/login — sets Sanctum session cookie. */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->auth->attemptLogin($request->only('email', 'password'));
        $request->session()->regenerate();

        return response()->json(['data' => ['user' => new UserResource($user)]]);
    }

    /** POST /auth/logout */
    public function logout(Request $request): JsonResponse
    {
        $this->auth->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['data' => null], 200);
    }

    /** GET /me — profil sesi aktif */
    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => new UserResource($request->user())]);
    }

    /**
     * GET /auth/verify-email/{id}/{hash} — 5.2_API_List.md §2, public.
     * Custom (not Laravel's stock EmailVerificationRequest) because that
     * class requires an authenticated session; this must work for a user
     * who registered on another device and isn't logged in here.
     */
    public function verifyEmail(Request $request, int $id, string $hash): JsonResponse
    {
        if (! URL::hasValidSignature($request)) {
            abort(403, 'Tautan verifikasi tidak valid atau sudah kedaluwarsa.');
        }

        $user = User::findOrFail($id);

        if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            abort(403, 'Tautan verifikasi tidak valid.');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return response()->json(['data' => null, 'message' => 'Email berhasil diverifikasi.']);
    }

    /** POST /auth/verify-email/resend — lihat AuthService::resendVerification. */
    public function resendVerification(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $this->auth->resendVerification($request->input('email'));

        return response()->json([
            'data' => null,
            'message' => 'Jika email terdaftar dan belum terverifikasi, tautan verifikasi telah dikirim.',
        ]);
    }

    /** POST /auth/forgot-password — FR-003, dikirim via SMTP (bukan notifikasi in-app). */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        Password::sendResetLink($request->only('email'));

        // Balasan generik selalu sama baik email terdaftar atau tidak (cegah user enumeration).
        return response()->json([
            'data' => null,
            'message' => 'Jika email terdaftar, tautan reset password telah dikirim.',
        ]);
    }

    /** POST /auth/reset-password — FR-003 */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => $password])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json(['data' => null, 'message' => 'Password berhasil diubah.']);
    }
}
