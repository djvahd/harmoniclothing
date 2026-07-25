<?php

namespace App\Repositories;

use App\Models\CreatorProfile;
use App\Models\Design;
use App\Models\OrderItem;
use App\Models\Review;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

/** Creator tab of Marketplace Desain — public, read-only, mirrors DesignRepository's shape. */
class CreatorRepository
{
    public function paginate(?string $search, string $sort, int $perPage): LengthAwarePaginator
    {
        $query = CreatorProfile::query()
            ->where('status', 'aktif')
            ->with('user')
            ->addSelect(['design_count' => $this->designCountSubquery()])
            ->addSelect(['sold_count' => $this->soldCountSubquery()])
            ->addSelect(['avg_rating' => $this->avgRatingSubquery()])
            ->addSelect(['review_count' => $this->reviewCountSubquery()])
            ->when($search, fn ($query) => $query->where(
                fn ($q) => $q->where('brand_name', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"))
            ));

        return $this->applySort($query, $sort)->paginate($perPage);
    }

    private function applySort(Builder $query, string $sort): Builder
    {
        return match ($sort) {
            'terlaris' => $query->orderByDesc('sold_count'),
            'rating' => $query->orderByDesc('avg_rating'),
            default => $query->orderByDesc('approved_at'), // terbaru
        };
    }

    /** Active designs this creator has published. */
    private function designCountSubquery(): Builder
    {
        return Design::query()
            ->selectRaw('count(*)')
            ->where('status', 'aktif')
            ->whereColumn('designs.creator_id', 'creator_profiles.user_id');
    }

    /** Sums order_items.quantity across every design by this creator, excluding cancelled/rejected orders. */
    private function soldCountSubquery(): Builder
    {
        return OrderItem::query()
            ->selectRaw('coalesce(sum(order_items.quantity), 0)')
            ->join('designs', 'designs.id', '=', 'order_items.design_id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereColumn('designs.creator_id', 'creator_profiles.user_id')
            ->whereNotIn('orders.status', ['dibatalkan', 'ditolak']);
    }

    /** Averages reviews across every design by this creator. */
    private function avgRatingSubquery(): Builder
    {
        return Review::query()
            ->selectRaw('avg(reviews.rating)')
            ->join('order_items', 'order_items.id', '=', 'reviews.order_item_id')
            ->join('designs', 'designs.id', '=', 'order_items.design_id')
            ->whereColumn('designs.creator_id', 'creator_profiles.user_id');
    }

    /** Counts reviews across every design by this creator. */
    private function reviewCountSubquery(): Builder
    {
        return Review::query()
            ->selectRaw('count(*)')
            ->join('order_items', 'order_items.id', '=', 'reviews.order_item_id')
            ->join('designs', 'designs.id', '=', 'order_items.design_id')
            ->whereColumn('designs.creator_id', 'creator_profiles.user_id');
    }
}
