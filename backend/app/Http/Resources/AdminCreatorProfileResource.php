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
            'kyc_full_name' => $this->kyc_full_name,
            'kyc_id_number' => $this->kyc_id_number,
            'status' => $this->status,
            'rejection_reason' => $this->rejection_reason,
            'approved_at' => $this->approved_at,
            'created_at' => $this->created_at,
        ];
    }
}
