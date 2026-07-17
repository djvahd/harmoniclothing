<?php

namespace App\Models;

use Database\Factories\CommissionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** 4.3_Table_Design.md — commissions (komisi Creator per order item). */
#[Fillable(['creator_id', 'order_item_id', 'amount', 'status', 'paid_at'])]
class Commission extends Model
{
    /** @use HasFactory<CommissionFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}
