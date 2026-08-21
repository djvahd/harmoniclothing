<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Profile photo upload (any role). Stricter than UploadMockupFileRequest/
 * UploadDesignFileRequest — no SVG (irrelevant for a photo, and avoids the
 * sanitizer path entirely), smaller cap since this is a personal photo, not
 * a print-ready design asset.
 */
class UploadProfilePhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimetypes:image/jpeg,image/png,image/webp', 'max:5120'],
        ];
    }
}
