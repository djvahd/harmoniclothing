<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** PATCH /admin/notification-settings/{type} — FE-038. */
class NotificationSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_enabled' => ['required', 'boolean'],
        ];
    }
}
