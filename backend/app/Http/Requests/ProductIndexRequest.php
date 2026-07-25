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
            'categories' => ['sometimes', 'array'],
            'categories.*' => ['string'],
            'genders' => ['sometimes', 'array'],
            'genders.*' => ['string', 'in:pria,wanita,unisex,anak'],
            'price_min' => ['sometimes', 'numeric', 'min:0'],
            // gte:price_min only makes sense when both bounds are present -
            // applied unconditionally it fails validation whenever only
            // price_max is sent (Laravel treats the absent price_min as not
            // comparable), turning a plain max-only filter into a 422.
            'price_max' => array_filter([
                'sometimes',
                'numeric',
                'min:0',
                $this->filled('price_min') ? 'gte:price_min' : null,
            ]),
            'sizes' => ['sometimes', 'array'],
            'sizes.*' => ['string'],
            'colors' => ['sometimes', 'array'],
            'colors.*' => ['string'],
            'materials' => ['sometimes', 'array'],
            'materials.*' => ['string'],
            'print_areas' => ['sometimes', 'array'],
            'print_areas.*' => ['string', 'in:depan,belakang,lengan'],
            'sort' => ['sometimes', 'string', 'in:terbaru,harga_asc,harga_desc,terlaris,rating'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'lang' => ['sometimes', 'string', 'in:id,en'],
        ];
    }
}
