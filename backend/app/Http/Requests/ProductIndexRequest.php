<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** 5.3_API_Specification.md §8 GET /catalog/products query params. */
class ProductIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['sometimes', 'string'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'lang' => ['sometimes', 'string', 'in:id,en'],
        ];
    }
}
