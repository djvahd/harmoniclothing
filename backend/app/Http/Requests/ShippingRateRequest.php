<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * POST /checkout/shipping-rates — preview courier options + prices before
 * checkout. Accepts either `cart_item_ids` (regular checkout page) or
 * `items` (Bulk Order page, which bypasses the cart) — exactly one.
 */
class ShippingRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'address_id' => [
                'required',
                'integer',
                Rule::exists('addresses', 'id')->where('user_id', $this->user()->id),
            ],
            'cart_item_ids' => ['nullable', 'array', 'min:1'],
            'cart_item_ids.*' => [
                'integer',
                Rule::exists('cart_items', 'id')->where('user_id', $this->user()->id),
            ],
            'items' => ['nullable', 'array', 'min:1'],
            'items.*.product_variant_id' => ['required_with:items', 'integer', 'exists:product_variants,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $hasCartItems = ! empty($this->input('cart_item_ids'));
            $hasItems = ! empty($this->input('items'));

            if ($hasCartItems === $hasItems) {
                $validator->errors()->add('cart_item_ids', 'Sertakan cart_item_ids ATAU items, tidak keduanya.');
            }
        });
    }
}
