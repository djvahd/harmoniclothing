<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 5.3_API_Specification.md POST /auth/login. Kredensial-salah error dibuat
 * generik di Controller/Service (bukan di sini) untuk mencegah user
 * enumeration — lihat AuthService::attemptLogin.
 */
class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
