<?php

namespace App\Services;

use App\Models\CreatorProfile;
use App\Models\Design;
use App\Repositories\DesignRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MarketplaceService
{
    public function __construct(private readonly DesignRepository $designs) {}

    /** GET /marketplace/designs — FE-008 browse, FE-009 search, FE-010 filter. */
    public function listDesigns(?string $categorySlug, ?string $search, int $perPage): LengthAwarePaginator
    {
        return $this->designs->paginate($categorySlug, $search, $perPage);
    }

    /** GET /marketplace/designs/{slug} — Detail Desain. */
    public function findDesign(string $slug): ?Design
    {
        return $this->designs->findBySlug($slug);
    }

    /** GET /marketplace/creators/{slug} — FE-011. */
    public function findCreator(string $slug): ?CreatorProfile
    {
        return CreatorProfile::query()
            ->where('status', 'aktif')
            ->where('slug', $slug)
            ->with(['user' => fn ($query) => $query->with(['designs' => fn ($q) => $q->active()])])
            ->first();
    }
}
