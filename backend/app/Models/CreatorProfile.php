<?php

namespace App\Models;

use Database\Factories\CreatorProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** 4.3_Table_Design.md — creator_profiles (KYC & status Creator). */
#[Fillable([
    'user_id', 'slug', 'brand_name', 'bio', 'portfolio_url', 'terms_accepted_at',
    'kyc_full_name', 'kyc_id_number', 'birth_date', 'address', 'ktp_photo_path',
    'payout_method', 'payout_account_number', 'payout_account_holder',
    'guardian_name', 'guardian_id_number', 'guardian_consent_at',
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
            'address' => 'encrypted',
            'payout_account_number' => 'encrypted',
            'payout_account_holder' => 'encrypted',
            'guardian_name' => 'encrypted',
            'guardian_id_number' => 'encrypted',
            'birth_date' => 'date',
            'terms_accepted_at' => 'datetime',
            'guardian_consent_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Guardian fields (data wali) are only required/collected for Creators under 18 at KYC submission time. */
    public function isMinor(): bool
    {
        return $this->birth_date !== null && $this->birth_date->age < 18;
    }
}
