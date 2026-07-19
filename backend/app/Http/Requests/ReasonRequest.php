<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Shared "reason wajib, min. 10 karakter" validator (FR-043 pattern,
 * 5.3_API_Specification.md §8), reused across Creator/Design/Order
 * rejection endpoints in the Admin Dashboard module.
 */
class ReasonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:10'],
        ];
    }
}
