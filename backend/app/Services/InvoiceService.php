<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Support\Str;

/** FE-033 Invoice Otomatis — FR-018, generated when a payment succeeds. */
class InvoiceService
{
    public function generateFor(Order $order): Invoice
    {
        return Invoice::create([
            'order_id' => $order->id,
            'invoice_number' => $this->generateInvoiceNumber(),
            'issued_at' => now(),
        ]);
    }

    private function generateInvoiceNumber(): string
    {
        do {
            $candidate = 'INV-'.now()->format('Ymd').'-'.Str::padLeft((string) random_int(0, 9999), 4, '0');
        } while (Invoice::query()->where('invoice_number', $candidate)->exists());

        return $candidate;
    }
}
