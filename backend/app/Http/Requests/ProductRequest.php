<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * POST/PATCH /admin/catalog/products — FR-031. Shared by store & update,
 * same "PATCH replaces the full resource" convention as AddressRequest.
 * `slug` is not accepted here — auto-generated from name_id via
 * App\Support\SlugGenerator, same helper CreatorService/CreatorDesignService use.
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
            'gender_segment' => ['nullable', 'string', 'in:pria,wanita,unisex,anak'],
            'name_id' => ['required', 'string', 'max:150'],
            'name_en' => ['required', 'string', 'max:150'],
            'description_id' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'base_price' => ['required', 'numeric', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return ['base_price.min' => 'Harga dasar minimal Rp 1.'];
    }
}
