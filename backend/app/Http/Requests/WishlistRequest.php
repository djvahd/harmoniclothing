<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** 5.2_API_List.md §3 POST /wishlist — FE-030, one of product_id/design_id. */
class WishlistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required_without:design_id', 'nullable', 'integer', 'exists:products,id'],
            'design_id' => ['required_without:product_id', 'nullable', 'integer', 'exists:designs,id'],
        ];
    }
}
