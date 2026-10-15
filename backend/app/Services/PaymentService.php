<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Validation\ValidationException;

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
        $payment = Payment::create([
            'order_id' => $order->id,
            'amount' => $order->total,
            'status' => 'belum_dibayar',
        ]);

        if (blank(config('services.midtrans.server_key'))) {
            return null;
        }

        $url = $this->midtrans->createSnapTransaction($order);
        $payment->update(['snap_redirect_url' => $url]);

        return $url;
    }

    /**
     * Resume paying an unpaid order. Midtrans refuses a second Snap
     * transaction for the same order_id, so the URL saved at checkout is
     * reused; it is only created here for an order that never got one.
     */
    public function resume(Order $order): ?string
    {
        $payment = $order->payment;

        if ($order->status !== 'belum_dibayar' || $payment === null || $payment->status === 'berhasil') {
            throw ValidationException::withMessages([
                'status' => [__('messages.order.pay_invalid_status')],
            ]);
        }

        if (filled($payment->snap_redirect_url)) {
            return $payment->snap_redirect_url;
        }

        if (blank(config('services.midtrans.server_key'))) {
            return null;
        }

        $url = $this->midtrans->createSnapTransaction($order);
        $payment->update(['snap_redirect_url' => $url]);

        return $url;
    }
}
