<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/** BR-007: commission calculated automatically per paid transaction involving a Creator's design. */
class CommissionService
{
    /** Called from MidtransWebhookService when an order is marked paid. */
    public function generateForOrderItem(OrderItem $item): ?Commission
    {
        if (! $item->design_id) {
            return null; // FE-014 mode custom — no Creator design involved
        }

        $item->loadMissing('design');

        return Commission::create([
            'creator_id' => $item->design->creator_id,
            'order_item_id' => $item->id,
            'amount' => bcmul((string) $item->subtotal, (string) config('business.creator_commission_rate'), 2),
            'status' => 'terhutang',
        ]);
    }

    /** GET /creator/earnings — FR-026. */
    public function earningsFor(User $creator): Collection
    {
        return Commission::query()
            ->where('creator_id', $creator->id)
            ->with('orderItem.productVariant.product')
            ->latest()
            ->get();
    }

    public function summaryFor(User $creator): array
    {
        $commissions = Commission::query()->where('creator_id', $creator->id);

        // Builder::sum() returns a raw DB numeric, not run through the
        // model's decimal cast — format explicitly to match every other
        // monetary field in the API.
        $format = fn ($value) => number_format((float) $value, 2, '.', '');

        return [
            'total' => $format((clone $commissions)->sum('amount')),
            'terhutang' => $format((clone $commissions)->where('status', 'terhutang')->sum('amount')),
            'dibayar' => $format((clone $commissions)->where('status', 'dibayar')->sum('amount')),
            'ditahan' => $format((clone $commissions)->where('status', 'ditahan')->sum('amount')),
        ];
    }

    /** BR-020: banning a creator for a proven copyright violation holds all outstanding commissions. */
    public function holdAllTerhutangFor(User $creator): void
    {
        Commission::query()
            ->where('creator_id', $creator->id)
            ->where('status', 'terhutang')
            ->update(['status' => 'ditahan']);
    }
}
