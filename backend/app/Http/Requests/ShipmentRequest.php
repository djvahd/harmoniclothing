<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** POST /admin/orders/{id}/shipment — FR-022. */
class ShipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'courier' => ['required', 'string', 'max:50'],
        ];
    }
}
