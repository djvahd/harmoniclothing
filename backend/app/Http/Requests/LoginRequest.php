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

    /** Matches RegisterRequest: emails are stored lower-cased, so look them up lower-cased. */
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => mb_strtolower(trim($this->input('email')))]);
        }
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
