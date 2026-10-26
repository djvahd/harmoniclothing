<?php

namespace App\Http\Requests;

use App\Services\BiteshipService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        $couriers = collect(app(BiteshipService::class)->availableCouriers());
        $types = $couriers->firstWhere('company', $this->input('courier_company'))['types'] ?? [];

        return [
            'courier_company' => ['nullable', 'required_with:courier_type', 'string', Rule::in($couriers->pluck('company')->all())],
            'courier_type' => ['nullable', 'required_with:courier_company', 'string', Rule::in($types)],
        ];
    }
}
