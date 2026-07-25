<?php

namespace App\Repositories;

use App\Models\Category;
use App\Models\Design;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\Tag;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class DesignRepository
{
    private const STARTING_PRICE_SQL = '(select min(products.base_price) from design_product '
        .'join products on products.id = design_product.product_id '
        .'where design_product.design_id = designs.id)';

    /**
     * Marketplace Desain listing — mirrors ProductRepository::paginate()'s
     * shape (categories multi-select, price range, sort), scoped to the
     * design's own dimensions: category comes from designs.category_id,
     * price is the "mulai dari" starting_price derived from the apparel
     * (design_product -> products) the Creator attached, since a design has
     * no base_price of its own. tags is an additional dimension layered on
     * top per the 2026-07-25 filter expansion (Creator-assigned keywords).
     *
     * @param  array{categories?: array<int,string>, tags?: array<int,string>, search?: string, price_min?: float, price_max?: float, sort?: string}  $filters
     */
    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = Design::query()
            ->active()
            ->with(['category', 'creator', 'products', 'tags'])
            ->addSelect(['sold_count' => $this->soldCountSubquery()])
            ->addSelect(['avg_rating' => $this->avgRatingSubquery()])
            ->addSelect(['review_count' => $this->reviewCountSubquery()])
            ->addSelect(['starting_price' => $this->startingPriceSubquery()])
            ->when(! empty($filters['categories']), fn ($query) => $query->whereHas(
                'category',
                fn ($q) => $q->whereIn('slug', $filters['categories'])
            ))
            ->when(! empty($filters['tags']), fn ($query) => $query->whereHas(
                'tags',
                fn ($q) => $q->whereIn('slug', collect($filters['tags'])->map(fn ($t) => Str::slug($t))->all())
            ))
            // Search matches title OR tag name — grouped in its own closure
            // so the orWhereHas doesn't leak out as a top-level OR against
            // the rest of the query's AND-chained filters/scopes.
            ->when($filters['search'] ?? null, fn ($query) => $query->where(
                fn ($q) => $q->where('title', 'like', '%'.$filters['search'].'%')
                    ->orWhereHas('tags', fn ($qq) => $qq->where('name', 'like', '%'.$filters['search'].'%'))
            ))
            // starting_price has no real column to filter on (it's a
            // computed "cheapest attached apparel" value) — HAVING on the
            // SELECT alias breaks Laravel's paginate() count() query (which
            // strips the SELECT list down to count(*) but keeps HAVING), so
            // the same correlated subquery is repeated inline via whereRaw,
            // which works in both the main query and the count query.
            // The bound value is wrapped in CAST(? AS DECIMAL(12,2)) rather
            // than compared directly: Laravel's PDO binder only uses
            // PARAM_INT for genuine PHP ints (is_int(100000.0) is false),
            // so a float or a numeric string both bind as PARAM_STR — and
            // SQLite's type-affinity rules rank any TEXT value above every
            // REAL/INTEGER value, silently making "500000 <= '100000'" true.
            // The CAST forces NUMERIC affinity on the bound value itself
            // regardless of how PDO bound it, and is valid on MySQL too.
            ->when(isset($filters['price_min']), fn ($query) => $query->whereRaw(self::STARTING_PRICE_SQL.' >= CAST(? AS DECIMAL(12,2))', [$filters['price_min']]))
            ->when(isset($filters['price_max']), fn ($query) => $query->whereRaw(self::STARTING_PRICE_SQL.' <= CAST(? AS DECIMAL(12,2))', [$filters['price_max']]));

        return $this->applySort($query, $filters['sort'] ?? 'terbaru')->paginate($perPage);
    }

    /**
     * Sidebar filter facets for Marketplace Desain — design's own category, a
     * price range, and the most-used Creator tags (popular_tags, capped
     * rather than exhaustive since tags are freeform/unbounded).
     *
     * @return array{categories: array<int, array{slug: string, name: string}>, popular_tags: array<int, array{slug: string, name: string}>, price_min: float, price_max: float}
     */
    public function filterOptions(string $lang = 'id'): array
    {
        $priceRange = Product::query()
            ->selectRaw('min(products.base_price) as min, max(products.base_price) as max')
            ->join('design_product', 'design_product.product_id', '=', 'products.id')
            ->join('designs', 'designs.id', '=', 'design_product.design_id')
            ->where('designs.status', 'aktif')
            ->first();

        $categories = Category::query()
            ->where('categories.type', 'design')
            ->whereHas('designs', fn ($q) => $q->active())
            ->orderBy("categories.name_{$lang}")
            ->get(['categories.slug as slug', "categories.name_{$lang} as name"]);

        $popularTags = Tag::query()
            ->join('design_tag', 'design_tag.tag_id', '=', 'tags.id')
            ->join('designs', 'designs.id', '=', 'design_tag.design_id')
            ->where('designs.status', 'aktif')
            ->groupBy('tags.id', 'tags.name', 'tags.slug')
            ->orderByRaw('count(*) desc')
            ->limit(15)
            ->get(['tags.slug as slug', 'tags.name as name']);

        return [
            'categories' => $categories->map(fn ($c) => ['slug' => $c->slug, 'name' => $c->name])->all(),
            'popular_tags' => $popularTags->map(fn ($t) => ['slug' => $t->slug, 'name' => $t->name])->all(),
            'price_min' => (float) ($priceRange->min ?? 0),
            'price_max' => (float) ($priceRange->max ?? 0),
        ];
    }

    private function applySort(Builder $query, string $sort): Builder
    {
        return match ($sort) {
            'harga_asc' => $query->orderBy('starting_price'),
            'harga_desc' => $query->orderByDesc('starting_price'),
            'terlaris' => $query->orderByDesc('sold_count'),
            'rating' => $query->orderByDesc('avg_rating'),
            default => $query->latest(),
        };
    }

    /** Sums order_items.quantity for this design directly, excluding cancelled/rejected orders. */
    private function soldCountSubquery(): Builder
    {
        return OrderItem::query()
            ->selectRaw('coalesce(sum(order_items.quantity), 0)')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereColumn('order_items.design_id', 'designs.id')
            ->whereNotIn('orders.status', ['dibatalkan', 'ditolak']);
    }

    /** Averages reviews left on order items that used this design. */
    private function avgRatingSubquery(): Builder
    {
        return Review::query()
            ->selectRaw('avg(reviews.rating)')
            ->join('order_items', 'order_items.id', '=', 'reviews.order_item_id')
            ->whereColumn('order_items.design_id', 'designs.id');
    }

    /** Counts reviews left on order items that used this design. */
    private function reviewCountSubquery(): Builder
    {
        return Review::query()
            ->selectRaw('count(*)')
            ->join('order_items', 'order_items.id', '=', 'reviews.order_item_id')
            ->whereColumn('order_items.design_id', 'designs.id');
    }

    /** "Mulai dari" price — cheapest apparel the Creator attached this design to. */
    private function startingPriceSubquery(): Builder
    {
        return Product::query()
            ->selectRaw('min(products.base_price)')
            ->join('design_product', 'design_product.product_id', '=', 'products.id')
            ->whereColumn('design_product.design_id', 'designs.id');
    }

    public function findBySlug(string $slug): ?Design
    {
        return Design::query()
            ->active()
            ->with(['category', 'creator', 'products.category', 'products.variants', 'tags'])
            ->addSelect(['sold_count' => $this->soldCountSubquery()])
            ->addSelect(['avg_rating' => $this->avgRatingSubquery()])
            ->addSelect(['review_count' => $this->reviewCountSubquery()])
            ->addSelect(['starting_price' => $this->startingPriceSubquery()])
            ->where('slug', $slug)
            ->first();
    }
}
