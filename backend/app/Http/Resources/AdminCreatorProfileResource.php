<?php

namespace App\Http\Resources;

use App\Models\CreatorProfile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin CreatorProfile
 *
 * Admin-only view of a creator's KYC submission (BR-001/008 review). Unlike
 * the public CreatorProfileResource (FE-011), this exposes kyc_full_name/
 * kyc_id_number — never render this to non-Admin callers.
 */
class AdminCreatorProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
            'slug' => $this->slug,
            'brand_name' => $this->brand_name,
            'bio' => $this->bio,
            'portfolio_url' => $this->portfolio_url,
            'kyc_full_name' => $this->kyc_full_name,
            'kyc_id_number' => $this->kyc_id_number,
            'birth_date' => $this->birth_date,
            'is_minor' => $this->isMinor(),
            'address' => $this->address,
            'has_ktp_photo' => $this->ktp_photo_path !== null,
            'payout_method' => $this->payout_method,
            'payout_account_number' => $this->payout_account_number,
            'payout_account_holder' => $this->payout_account_holder,
            'guardian_name' => $this->guardian_name,
            'guardian_id_number' => $this->guardian_id_number,
            'guardian_consent_at' => $this->guardian_consent_at,
            'status' => $this->status,
            'rejection_reason' => $this->rejection_reason,
            'approved_at' => $this->approved_at,
            'created_at' => $this->created_at,
        ];
    }
}
