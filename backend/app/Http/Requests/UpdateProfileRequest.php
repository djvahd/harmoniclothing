<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 5.2_API_List.md PATCH /account/profile — FR-004. Only `name`/`phone` are
 * editable here: `email` change would require re-verification (out of scope
 * for this pass) and `role`/`status` are admin-provisioned only (4.3 note).
 */
class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'regex:/^\+?[0-9][0-9 ]{7,18}[0-9]$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Nomor telepon hanya boleh berisi angka, spasi, atau awalan +, dengan panjang 9-20 karakter.',
        ];
    }
}
