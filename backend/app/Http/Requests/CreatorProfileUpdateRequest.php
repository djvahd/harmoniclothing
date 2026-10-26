<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** PATCH /creator/profile — public-facing brand fields only; payout and KYC data are not editable here. */
class CreatorProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brand_name' => ['nullable', 'string', 'max:150'],
            'bio' => ['nullable', 'string', 'max:500'],
            'portfolio_url' => ['nullable', 'url', 'max:255'],
        ];
    }
}
