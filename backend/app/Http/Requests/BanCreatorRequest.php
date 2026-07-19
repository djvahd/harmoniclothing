<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * POST /admin/creators/{id}/ban — BR-019/020/023. `copyright_violation`
 * gates whether the ban additionally suspends the linked user account and
 * holds outstanding commissions (BR-020) — a plain ban (e.g. inactivity,
 * ToS aside from copyright) does not trigger those extra consequences.
 */
class BanCreatorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:10'],
            'copyright_violation' => ['sometimes', 'boolean'],
        ];
    }
}
