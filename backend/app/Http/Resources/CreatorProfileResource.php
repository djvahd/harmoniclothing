<?php

namespace App\Http\Resources;

use App\Models\CreatorProfile;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin CreatorProfile
 *
 * FE-011 public creator profile. Public-facing name prefers brand_name
 * (2026-07-22 addition — public-facing, not KYC data), falling back to
 * users.name when no brand_name was set (same fallback DesignResource
 * uses for the "by {creator}" byline). Assumes the caller eager-loaded
 * `user.designs` (only active ones, filtered by the repository) before
 * constructing this resource.
 */
class CreatorProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->brand_name ?? $this->user->name,
            'photo_url' => $this->user->photo_path
                ? app(FileUploadService::class)->url($this->user->photo_path)
                : null,
            'bio' => $this->bio,
            'portfolio_url' => $this->portfolio_url,
            'slug' => $this->slug,
            'since' => $this->approved_at,
            'designs' => DesignResource::collection($this->user->designs),
        ];
    }
}
