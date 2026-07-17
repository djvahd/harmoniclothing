<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** 5.2_API_List.md §3 POST /cart — BR-025 price snapshot computed server-side, not client input. */
class CartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'design_id' => ['nullable', 'integer', 'exists:designs,id'],
            'custom_design_file_path' => ['nullable', 'string', 'max:255'],
            'design_position' => ['nullable', 'array'],
            'quantity' => ['required', 'integer', 'min:1'], // BR-009: no MOQ
            'notes' => ['nullable', 'string'], // FR-013/019
        ];
    }
}
