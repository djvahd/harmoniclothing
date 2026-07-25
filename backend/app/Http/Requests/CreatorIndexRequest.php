<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** GET /marketplace/creators — Creator tab of Marketplace Desain. */
class CreatorIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'string', 'max:150'],
            'categories' => ['sometimes', 'array'],
            'categories.*' => ['string'],
            'sort' => ['sometimes', 'string', 'in:terbaru,terlaris,rating'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}
