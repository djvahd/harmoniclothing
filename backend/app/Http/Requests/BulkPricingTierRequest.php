<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * POST /admin/catalog/bulk-pricing-tiers — BR-012. One global tiering scheme
 * for all products (4.1_Entity_Identification.md), not per-product/category.
 */
class BulkPricingTierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'min_qty' => ['required', 'integer', 'min:1'],
            'max_qty' => ['nullable', 'integer', 'gte:min_qty'],
            'price_per_unit' => ['required', 'numeric', 'min:0'],
        ];
    }
}
