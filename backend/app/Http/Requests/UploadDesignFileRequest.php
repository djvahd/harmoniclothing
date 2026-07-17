<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FR-010 / FE-015 upload desain sendiri. 5.6_Security_Planning.md §5: MIME
 * whitelist ketat (bukan cek ekstensi), maksimal 20MB — 1.5 Bagian 9.
 */
class UploadDesignFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimetypes:image/png,image/svg+xml', 'max:20480'],
        ];
    }
}
