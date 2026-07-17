<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $auth)
    {
    }

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

        return response()->json(['data' => ['user' => $this->presentUser($user)]]);
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
        return response()->json(['data' => $this->presentUser($request->user())]);
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
            throw \Illuminate\Validation\ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json(['data' => null, 'message' => 'Password berhasil diubah.']);
    }

    private function presentUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role->value,
        ];
    }
}
