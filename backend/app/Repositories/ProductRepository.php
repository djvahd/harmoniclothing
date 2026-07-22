<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductRepository
{
    public function paginate(?string $categorySlug, int $perPage): LengthAwarePaginator
    {
        return Product::query()
            ->active()
            ->with('category')
            ->when($categorySlug, fn ($query) => $query->whereHas(
                'category',
                fn ($q) => $q->where('slug', $categorySlug)
            ))
            ->latest()
            ->paginate($perPage);
    }

    /**
     * GET /admin/catalog/products — admin management list (gap-filled).
     * Unlike paginate(), deliberately omits the active() scope so inactive
     * products remain visible/editable from Kelola Product Catalog.
     */
    public function paginateForAdmin(?string $categorySlug, int $perPage): LengthAwarePaginator
    {
        return Product::query()
            ->with('category')
            ->when($categorySlug, fn ($query) => $query->whereHas(
                'category',
                fn ($q) => $q->where('slug', $categorySlug)
            ))
            ->latest()
            ->paginate($perPage);
    }

    public function findBySlug(string $slug): ?Product
    {
        return Product::query()
            ->active()
            ->with(['category', 'variants'])
            ->where('slug', $slug)
            ->first();
    }
}
