<?php

namespace App\Services;

use App\Models\CreatorProfile;
use App\Models\Design;
use App\Repositories\CreatorRepository;
use App\Repositories\DesignRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MarketplaceService
{
    public function __construct(
        private readonly DesignRepository $designs,
        private readonly CreatorRepository $creators,
    ) {}

    /**
     * GET /marketplace/designs — FE-008 browse, FE-009 search, FE-010 filter.
     *
     * @param  array{categories?: array<int,string>, search?: string, price_min?: float, price_max?: float, sort?: string}  $filters
     */
    public function listDesigns(array $filters, int $perPage): LengthAwarePaginator
    {
        return $this->designs->paginate($filters, $perPage);
    }

    /** GET /marketplace/designs/filters — sidebar facets for the Marketplace Desain filter panel. */
    public function getDesignFilterOptions(string $lang = 'id'): array
    {
        return $this->designs->filterOptions($lang);
    }

    /** GET /marketplace/designs/{slug} — Detail Desain. */
    public function findDesign(string $slug): ?Design
    {
        return $this->designs->findBySlug($slug);
    }

    /** GET /marketplace/creators — Creator tab of Marketplace Desain. */
    public function listCreators(?string $search, string $sort, int $perPage): LengthAwarePaginator
    {
        return $this->creators->paginate($search, $sort, $perPage);
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
