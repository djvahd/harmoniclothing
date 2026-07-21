<?php

namespace App\Repositories;

use App\Models\Design;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class DesignRepository
{
    public function paginate(?string $categorySlug, ?string $search, int $perPage): LengthAwarePaginator
    {
        return Design::query()
            ->active()
            ->with(['category', 'creator', 'products'])
            ->when($categorySlug, fn ($query) => $query->whereHas(
                'category',
                fn ($q) => $q->where('slug', $categorySlug)
            ))
            ->when($search, fn ($query) => $query->where('title', 'like', "%{$search}%"))
            ->latest()
            ->paginate($perPage);
    }

    public function findBySlug(string $slug): ?Design
    {
        return Design::query()
            ->active()
            ->with(['category', 'creator', 'products.category', 'products.variants'])
            ->where('slug', $slug)
            ->first();
    }
}
