<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * POST/PATCH .../variants — FE-046 (gap-filled: not individually enumerated
 * in 5.2_API_List.md, but FE-046's own description names "+ aset mockup 3D
 * per varian" as in scope). `mockup_asset_path` is a plain string reference
 * to an already-hosted .glb/.gltf asset — this pass doesn't add a new binary
 * upload pipeline for 3D assets, only basic variant CRUD.
 */
class ProductVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'color' => ['required', 'string', 'max:50'],
            'size' => ['required', 'string', 'max:20'],
            'cut_type' => ['required', 'string', 'max:50'],
            'print_areas' => ['sometimes', 'array'],
            'print_areas.*' => ['string', 'in:depan,belakang,lengan'],
            'material' => ['required', 'string', 'max:100'],
            'price_modifier' => ['sometimes', 'numeric'],
            'mockup_asset_path' => ['required', 'string'],
        ];
    }
}
