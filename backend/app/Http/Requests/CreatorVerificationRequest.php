<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * 5.2_API_List.md §5 POST /creator/verification — FR-035, BR-008.
 * Expanded 2026-07-22 from "KYC sederhana" into full identity + payout
 * destination + a guardian branch for Creators under 18 at submission time.
 */
class CreatorVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // An unparseable birth_date must reach the 'date' rule below (422),
        // not blow up here with an InvalidFormatException (HTTP 500).
        try {
            $isMinor = $this->filled('birth_date') && Carbon::parse($this->input('birth_date'))->age < 18;
        } catch (\Throwable) {
            $isMinor = false;
        }

        $rules = [
            'kyc_full_name' => ['required', 'string', 'max:150'],
            'kyc_id_number' => ['required', 'string', 'max:100'],
            'birth_date' => ['required', 'date', 'before:today'],
            'address' => ['required', 'string', 'max:500'],
            'ktp_photo' => ['required', 'file', 'mimetypes:image/jpeg,image/png', 'max:5120'],
            'payout_method' => ['required', Rule::in(['bank_transfer', 'gopay', 'ovo', 'dana', 'shopeepay'])],
            'payout_account_number' => ['required', 'string', 'max:50'],
            'payout_account_holder' => ['required', 'string', 'max:150'],
        ];

        // 'accepted' is an implicit rule — it fails on a missing field even
        // with 'nullable' alongside it, so the guardian rules must branch
        // entirely rather than relying on requiredIf() to gate a shared set.
        if ($isMinor) {
            $rules['guardian_name'] = ['required', 'string', 'max:150'];
            $rules['guardian_id_number'] = ['required', 'string', 'max:100'];
            $rules['guardian_consent'] = ['required', 'accepted'];
        } else {
            $rules['guardian_name'] = ['nullable', 'string', 'max:150'];
            $rules['guardian_id_number'] = ['nullable', 'string', 'max:100'];
            $rules['guardian_consent'] = ['nullable', 'boolean'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'guardian_name.required' => __('messages.creator.guardian_name_required'),
            'guardian_id_number.required' => __('messages.creator.guardian_id_required'),
            'guardian_consent.required' => __('messages.creator.guardian_consent_required'),
            'guardian_consent.accepted' => __('messages.creator.guardian_consent_required'),
        ];
    }
}
