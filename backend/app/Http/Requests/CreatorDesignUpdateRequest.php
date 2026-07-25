<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** PATCH /creator/designs/{id} — BR-028 revision. File is optional (keep existing if omitted). */
class CreatorDesignUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'file' => ['sometimes', 'file', 'mimetypes:image/png,image/svg+xml', 'max:20480'],
            'product_ids' => ['required', 'array', 'min:1'],
            'product_ids.*' => ['integer', 'exists:products,id'],
            'tags' => ['sometimes', 'array', 'max:10'],
            'tags.*' => ['string', 'max:30'],
        ];
    }
}
