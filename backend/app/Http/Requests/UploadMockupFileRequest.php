<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FE-046 admin variant mockup photo upload. Same MIME whitelist/size cap as
 * UploadDesignFileRequest (5.6_Security_Planning.md §5) since both go
 * through FileUploadService::storeDesignFile().
 */
class UploadMockupFileRequest extends FormRequest
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
