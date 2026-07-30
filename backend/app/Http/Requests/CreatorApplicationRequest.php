<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** POST /account/become-creator — FR-041, plus public-facing brand fields (2026-07-22 decision). */
class CreatorApplicationRequest extends FormRequest
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
            'terms_accepted' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'terms_accepted.required' => __('messages.creator.terms_required'),
            'terms_accepted.accepted' => __('messages.creator.terms_required'),
        ];
    }
}
