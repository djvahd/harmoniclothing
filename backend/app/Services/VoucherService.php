<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Validation\ValidationException;

/**
 * #98 — checks a code against a customer's cart and works out the discount.
 * Money is whole rupiah end to end (Midtrans takes integers), so percent
 * discounts are truncated, never rounded up in the customer's favour.
 */
class VoucherService
{
    public function __construct(private readonly AuditLogService $auditLog) {}

    /** 2.5_Permission_Matrix.md §10: pricing changes are audited. */
    public function create(array $data, User $admin): Voucher
    {
        $voucher = Voucher::create($this->normalise($data))->refresh();
        $this->auditLog->record($admin, 'voucher.create', $voucher, "{$voucher->code} ({$voucher->type})");

        return $voucher;
    }

    public function update(Voucher $voucher, array $data, User $admin): Voucher
    {
        $voucher->update($this->normalise($data));
        $this->auditLog->record($admin, 'voucher.update', $voucher, "{$voucher->code} active=".($voucher->is_active ? '1' : '0'));

        return $voucher->fresh();
    }

    /** free_shipping carries no value; empty optional fields fall back to their column defaults. */
    private function normalise(array $data): array
    {
        if (($data['type'] ?? null) === Voucher::TYPE_FREE_SHIPPING) {
            $data['value'] = 0;
        }
        foreach (['value', 'min_subtotal'] as $field) {
            if (array_key_exists($field, $data) && $data[$field] === null) {
                $data[$field] = 0;
            }
        }

        return $data;
    }

    /**
     * @return array{0: Voucher, 1: string} the voucher and the discount to subtract from the order total
     *
     * @throws ValidationException on field `voucher_code`
     */
    public function resolve(string $code, User $user, string $subtotal, int $shippingCost, bool $lock = false): array
    {
        $query = Voucher::query()->where('code', strtoupper(trim($code)));
        if ($lock) {
            // Serialises concurrent checkouts so the last unit of quota cannot be used twice.
            $query->lockForUpdate();
        }
        $voucher = $query->first();

        if ($voucher === null || ! $voucher->is_active) {
            $this->fail('invalid');
        }
        if ($voucher->starts_at !== null && $voucher->starts_at->isFuture()) {
            $this->fail('not_started');
        }
        if ($voucher->expires_at !== null && $voucher->expires_at->isPast()) {
            $this->fail('expired');
        }
        if (bccomp($subtotal, (string) $voucher->min_subtotal, 2) < 0) {
            $this->fail('min_subtotal', ['amount' => number_format((float) $voucher->min_subtotal, 0, ',', '.')]);
        }
        if ($voucher->quota !== null && $voucher->redemptions()->count() >= $voucher->quota) {
            $this->fail('quota_reached');
        }
        if ($this->usedBefore($voucher, $user)) {
            $this->fail('already_used');
        }

        return [$voucher, $this->discountFor($voucher, $subtotal, $shippingCost)];
    }

    /** One use per customer; a cancelled order gives the use back. */
    private function usedBefore(Voucher $voucher, User $user): bool
    {
        return Order::query()
            ->where('voucher_id', $voucher->id)
            ->where('user_id', $user->id)
            ->where('status', '!=', 'dibatalkan')
            ->exists();
    }

    private function discountFor(Voucher $voucher, string $subtotal, int $shippingCost): string
    {
        $discount = match ($voucher->type) {
            Voucher::TYPE_NOMINAL => (string) $voucher->value,
            Voucher::TYPE_PERCENT => bcdiv(bcmul($subtotal, (string) $voucher->value, 2), '100', 0),
            Voucher::TYPE_FREE_SHIPPING => (string) $shippingCost,
        };

        if ($voucher->max_discount !== null && bccomp($discount, (string) $voucher->max_discount, 2) > 0) {
            $discount = (string) $voucher->max_discount;
        }

        // Never discount more than the order costs, and always leave a payable remainder.
        $ceiling = bcsub(bcadd($subtotal, (string) $shippingCost, 2), (string) config('business.voucher_min_payable'), 2);
        if (bccomp($discount, $ceiling, 2) > 0) {
            $discount = $ceiling;
        }

        return bccomp($discount, '0', 2) > 0 ? bcadd($discount, '0', 0) : '0';
    }

    private function fail(string $reason, array $replace = []): never
    {
        throw ValidationException::withMessages([
            'voucher_code' => [__("messages.voucher.{$reason}", $replace)],
        ]);
    }
}
