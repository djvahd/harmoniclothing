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
            'phone' => ['required', 'string', 'max:20'],
            'province' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'district' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:10'],
            'address_line' => ['required', 'string'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }
}
