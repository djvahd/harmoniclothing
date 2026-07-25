<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** 5.2_API_List.md §3 GET /marketplace/designs — FE-008 browse, FE-009 search, FE-010 filter. */
class DesignIndexRequest extends FormRequest
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
            'tags' => ['sometimes', 'array'],
            'tags.*' => ['string'],
            'search' => ['sometimes', 'string', 'max:150'],
            'price_min' => ['sometimes', 'numeric', 'min:0'],
            // gte:price_min only makes sense when both bounds are present -
            // applied unconditionally it fails validation whenever only
            // price_max is sent, turning a plain max-only filter into a 422
            // (same fix as ProductIndexRequest's price_max rule).
            'price_max' => array_filter([
                'sometimes',
                'numeric',
                'min:0',
                $this->filled('price_min') ? 'gte:price_min' : null,
            ]),
            'sort' => ['sometimes', 'string', 'in:terbaru,harga_asc,harga_desc,terlaris,rating'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'lang' => ['sometimes', 'string', 'in:id,en'],
        ];
    }
}
