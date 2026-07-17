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
            'category' => ['sometimes', 'string'],
            'search' => ['sometimes', 'string', 'max:150'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}
