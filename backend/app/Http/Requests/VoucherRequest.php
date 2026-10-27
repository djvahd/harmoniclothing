<?php

namespace App\Http\Requests;

use App\Models\Voucher;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** POST/PATCH /admin/vouchers — #98. Admin only; on PATCH every field is optional. */
class VoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('code'))) {
            $this->merge(['code' => strtoupper(trim($this->input('code')))]);
        }
    }

    /** Readable names for the default validation messages ("kode voucher sudah digunakan"). */
    public function attributes(): array
    {
        return [
            'code' => __('messages.voucher.attr_code'),
            'value' => __('messages.voucher.attr_value'),
            'max_discount' => __('messages.voucher.attr_max_discount'),
            'min_subtotal' => __('messages.voucher.attr_min_subtotal'),
            'quota' => __('messages.voucher.attr_quota'),
            'starts_at' => __('messages.voucher.attr_starts_at'),
            'expires_at' => __('messages.voucher.attr_expires_at'),
        ];
    }

    public function rules(): array
    {
        $required = $this->isMethod('post') ? 'required' : 'sometimes';
        $voucher = $this->route('voucher');
        $type = $this->input('type', $voucher?->type);

        return [
            'code' => [$required, 'string', 'min:3', 'max:40', 'regex:/^[A-Z0-9_-]+$/', Rule::unique('vouchers', 'code')->ignore($voucher?->id)],
            'type' => [$required, Rule::in(Voucher::TYPES)],
            'value' => [
                Rule::requiredIf(fn () => $this->isMethod('post') && $type !== Voucher::TYPE_FREE_SHIPPING),
                'nullable',
                'numeric',
                'min:0',
                $type === Voucher::TYPE_PERCENT ? 'max:100' : 'max:100000000',
            ],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'min_subtotal' => ['nullable', 'numeric', 'min:0'],
            'quota' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after:starts_at'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
