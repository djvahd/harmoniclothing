<?php

namespace App\Models;

use Database\Factories\CreatorProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** 4.3_Table_Design.md — creator_profiles (KYC & status Creator). */
#[Fillable([
    'user_id', 'slug', 'kyc_full_name', 'kyc_id_number',
    'status', 'rejection_reason', 'approved_by', 'approved_at',
])]
class CreatorProfile extends Model
{
    /** @use HasFactory<CreatorProfileFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'kyc_full_name' => 'encrypted', // NFR-011
            'kyc_id_number' => 'encrypted', // NFR-011
            'approved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
