<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 4.3_Table_Design.md addresses cluster — shared by store & update (FR-048).
 * PATCH replaces the full address rather than patching individual fields.
 */
class AddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:50'],
            'recipient_name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'regex:/^\+?[0-9][0-9 ]{7,18}[0-9]$/'],
            'province' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'district' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'digits:5'],
            'address_line' => ['required', 'string'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Nomor telepon hanya boleh berisi angka, spasi, atau awalan +, dengan panjang 9-20 karakter.',
            'postal_code.digits' => 'Kode pos harus terdiri dari 5 digit angka.',
        ];
    }
}
