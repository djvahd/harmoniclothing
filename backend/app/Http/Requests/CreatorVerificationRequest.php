<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** 5.2_API_List.md §5 POST /creator/verification — FR-035, BR-008. */
class CreatorVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kyc_full_name' => ['required', 'string', 'max:150'],
            'kyc_id_number' => ['required', 'string', 'max:100'],
        ];
    }
}
