<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;

/**
 * FE-032. Creates the payments row and (when Midtrans credentials are
 * configured) the Snap redirect URL. Locally/in tests, MIDTRANS_SERVER_KEY
 * is empty (no sandbox account signed up yet — same gap as R2/SMTP), so
 * this degrades to "no redirect URL yet" rather than failing checkout.
 */
class PaymentService
{
    public function __construct(private readonly MidtransService $midtrans) {}

    public function initiate(Order $order): ?string
    {
        Payment::create([
            'order_id' => $order->id,
            'amount' => $order->total,
            'status' => 'belum_dibayar',
        ]);

        if (blank(config('services.midtrans.server_key'))) {
            return null;
        }

        return $this->midtrans->createSnapTransaction($order);
    }
}
