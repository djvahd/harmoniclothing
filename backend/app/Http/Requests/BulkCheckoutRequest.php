<?php

namespace App\Http\Requests;

use App\Models\ProductVariant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/** 5.2_API_List.md §4 POST /checkout/bulk — FR-040/044, BR-012/026, Flow 7. */
class BulkCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'address_id' => [
                'required',
                'integer',
                Rule::exists('addresses', 'id')->where('user_id', $this->user()->id),
            ],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'design_id' => ['nullable', 'integer', 'exists:designs,id'],
            'custom_design_file_path' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ];
    }

    /** BR-026 corollary: Flow 7 is one product per Bulk Order page, so every variant must belong to the same product. */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $variantIds = collect($this->input('items', []))
                ->pluck('product_variant_id')
                ->filter()
                ->all();

            if (empty($variantIds)) {
                return;
            }

            $productCount = ProductVariant::query()->whereIn('id', $variantIds)->distinct()->count('product_id');

            if ($productCount > 1) {
                $validator->errors()->add('items', 'Semua item Bulk Order harus dari produk yang sama.');
            }
        });
    }
}
