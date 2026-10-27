<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** 5.2_API_List.md §4 POST /checkout — FR-017. */
class CheckoutRequest extends FormRequest
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
            'cart_item_ids' => ['required', 'array', 'min:1'],
            'cart_item_ids.*' => [
                'integer',
                Rule::exists('cart_items', 'id')->where('user_id', $this->user()->id),
            ],
            'courier_company' => ['required', 'string', 'max:50'],
            'courier_type' => ['required', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'voucher_code' => ['nullable', 'string', 'max:40'],
            // Optional: omitted keeps every channel open in Snap (older clients, the bulk flow).
            'payment_method' => ['nullable', 'string', Rule::in(array_keys(config('services.midtrans.payment_methods')))],
        ];
    }
}
