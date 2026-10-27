<?php

namespace App\Models;

use Database\Factories\VoucherFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Admin-managed discount code, applied to regular checkout only (#98). */
#[Fillable(['code', 'type', 'value', 'max_discount', 'min_subtotal', 'quota', 'starts_at', 'expires_at', 'is_active'])]
class Voucher extends Model
{
    /** @use HasFactory<VoucherFactory> */
    use HasFactory;

    public const TYPE_NOMINAL = 'nominal';

    public const TYPE_PERCENT = 'percent';

    public const TYPE_FREE_SHIPPING = 'free_shipping';

    public const TYPES = [self::TYPE_NOMINAL, self::TYPE_PERCENT, self::TYPE_FREE_SHIPPING];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'max_discount' => 'decimal:2',
            'min_subtotal' => 'decimal:2',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /** Orders that still hold a redemption: a cancelled order releases it. */
    public function redemptions(): HasMany
    {
        return $this->orders()->where('status', '!=', 'dibatalkan');
    }
}
