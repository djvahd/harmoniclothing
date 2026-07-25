<?php

namespace App\Http\Resources;

use App\Models\CreatorProfile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin CreatorProfile
 *
 * Creator tab of Marketplace Desain (list card) — lighter than
 * CreatorProfileResource, which embeds the creator's full design list and is
 * only meant for the single-creator profile page. Assumes the caller
 * eager-loaded `user` and selected the design_count/sold_count/avg_rating/
 * review_count subquery aliases (see CreatorRepository::paginate()).
 */
class CreatorSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->brand_name ?? $this->user->name,
            'slug' => $this->slug,
            'bio' => $this->bio,
            'since' => $this->approved_at,
            'design_count' => (int) ($this->design_count ?? 0),
            'sold_count' => (int) ($this->sold_count ?? 0),
            'rating_average' => $this->avg_rating !== null ? round((float) $this->avg_rating, 1) : null,
            'review_count' => (int) ($this->review_count ?? 0),
        ];
    }
}
