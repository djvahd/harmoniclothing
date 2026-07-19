<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * PATCH /admin/orders/{id}/status — FR-021. The only Admin-triggered forward
 * transition is starting production; "dikirim" stays exclusively
 * webhook-driven (BiteshipWebhookService), and menunggu_konfirmasi/selesai
 * are Customer/system-driven (OrderService::confirmReceived, BR-014).
 */
class OrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['diproses_produksi'])],
        ];
    }
}
