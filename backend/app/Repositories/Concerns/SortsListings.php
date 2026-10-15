<?php

namespace App\Repositories\Concerns;

use Illuminate\Database\Eloquent\Builder;

/**
 * sold_count/avg_rating are always selected by the caller's paginate()
 * subqueries, so sorting by 'terlaris'/'rating' just orders by the alias —
 * no need to re-add the subquery here.
 */
trait SortsListings
{
    private function applySort(Builder $query, string $sort, string $priceColumn): Builder
    {
        return match ($sort) {
            'harga_asc' => $query->orderBy($priceColumn),
            'harga_desc' => $query->orderByDesc($priceColumn),
            'terlaris' => $query->orderByDesc('sold_count'),
            'rating' => $query->orderByDesc('avg_rating'),
            default => $query->latest()->latest('id'),
        };
    }
}
