<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** 5.2_API_List.md §4 POST /orders/{id}/reviews — FR-027, BR-004. */
class ReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_item_id' => ['required', 'integer'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string'],
        ];
    }
}
