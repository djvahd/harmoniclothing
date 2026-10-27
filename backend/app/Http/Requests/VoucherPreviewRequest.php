<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** POST /checkout/voucher/preview — #98. */
class VoucherPreviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:40'],
            'cart_item_ids' => ['required', 'array', 'min:1'],
            'cart_item_ids.*' => [
                'integer',
                Rule::exists('cart_items', 'id')->where('user_id', $this->user()->id),
            ],
            // Only matters for free-shipping codes, and only for the preview figure.
            'shipping_cost' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
