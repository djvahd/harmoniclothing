<?php

namespace App\Models;

use Database\Factories\AddressFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 4.3_Table_Design.md — Address Book (FR-048).
 */
#[Fillable([
    'user_id', 'label', 'recipient_name', 'phone',
    'province', 'city', 'district', 'postal_code',
    'address_line', 'is_default',
])]
class Address extends Model
{
    /** @use HasFactory<AddressFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'address_line' => 'encrypted', // NFR-011
            'recipient_name' => 'encrypted', // NFR-011, added 2026-07-21
            'phone' => 'encrypted', // NFR-011, added 2026-07-21
            'is_default' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
