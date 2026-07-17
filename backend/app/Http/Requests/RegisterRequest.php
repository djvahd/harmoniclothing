<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * 5.3_API_Specification.md POST /auth/register: email unik & valid, password
 * min. 8 karakter, privacy_accepted/terms_accepted wajib true (NFR-012).
 */
class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'privacy_accepted' => ['required', 'accepted'],
            'terms_accepted' => ['required', 'accepted'],
        ];
    }
}
