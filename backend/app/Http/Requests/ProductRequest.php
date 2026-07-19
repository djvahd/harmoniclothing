<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * POST/PATCH /admin/catalog/products — FR-031. Shared by store & update,
 * same "PATCH replaces the full resource" convention as AddressRequest.
 * `slug` is not accepted here — auto-generated from name_id, same pattern
 * as CreatorService/CreatorDesignService's generateSlug().
 */
class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'name_id' => ['required', 'string', 'max:150'],
            'name_en' => ['required', 'string', 'max:150'],
            'description_id' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
