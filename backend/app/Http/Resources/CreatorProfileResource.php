<?php

namespace App\Http\Resources;

use App\Models\CreatorProfile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin CreatorProfile
 *
 * FE-011 public creator profile. Public-facing name comes from users.name
 * (not kyc_full_name, which is private KYC data — same field the
 * marketplace design listing already shows as "creator"). Assumes the
 * caller eager-loaded `user.designs` (only active ones, filtered by the
 * repository) before constructing this resource.
 */
class CreatorProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->user->name,
            'slug' => $this->slug,
            'since' => $this->approved_at,
            'designs' => DesignResource::collection($this->user->designs),
        ];
    }
}
