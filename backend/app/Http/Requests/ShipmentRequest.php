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

    /**
     * Both optional — defaults to the courier the customer already chose
     * (and paid shipping for) at checkout. Admin passes these only to
     * override, e.g. if that courier turns out unavailable for pickup.
     */
    public function rules(): array
    {
        return [
            'courier_company' => ['nullable', 'string', 'max:50'],
            'courier_type' => ['nullable', 'string', 'max:50'],
        ];
    }
}
