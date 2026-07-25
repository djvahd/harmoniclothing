<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 5.2_API_List.md §5 POST/PATCH /creator/designs — "Upload desain + pilih
 * apparel" (FR-024). File constraints match FE-015's own-upload rules
 * (5.6_Security_Planning.md §5): strict MIME whitelist, 20MB max.
 */
class CreatorDesignRequest extends FormRequest
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
            'file' => ['required', 'file', 'mimetypes:image/png,image/svg+xml', 'max:20480'],
            'product_ids' => ['required', 'array', 'min:1'],
            'product_ids.*' => ['integer', 'exists:products,id'],
            'tags' => ['sometimes', 'array', 'max:10'],
            'tags.*' => ['string', 'max:30'],
        ];
    }
}
