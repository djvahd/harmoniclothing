<?php

namespace App\Repositories;

use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ProductRepository
{
    /**
     * Sidebar filter panel — all list dimensions (categories, genders,
     * sizes, colors, print_areas) are multi-select (OR within a dimension,
     * AND across dimensions), price_min/price_max are a single range.
     *
     * @param  array{categories?: array<int,string>, genders?: array<int,string>, sizes?: array<int,string>, colors?: array<int,string>, materials?: array<int,string>, print_areas?: array<int,string>, price_min?: float, price_max?: float, sort?: string}  $filters
     */
    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = Product::query()
            ->active()
            ->with(['category', 'variants'])
            ->when(!empty($filters['categories']), fn ($query) => $query->whereHas(
                'category',
                fn ($q) => $q->whereIn('slug', $filters['categories'])
            ))
            ->when(!empty($filters['genders']), fn ($query) => $query->whereIn('gender_segment', $filters['genders']))
            ->when(isset($filters['price_min']), fn ($query) => $query->where('base_price', '>=', $filters['price_min']))
            ->when(isset($filters['price_max']), fn ($query) => $query->where('base_price', '<=', $filters['price_max']))
            ->when(!empty($filters['sizes']), fn ($query) => $query->whereHas(
                'variants',
                fn ($q) => $q->whereIn('size', $filters['sizes'])
            ))
            ->when(!empty($filters['colors']), fn ($query) => $query->whereHas(
                'variants',
                fn ($q) => $q->whereIn('color', $filters['colors'])
            ))
            ->when(!empty($filters['materials']), fn ($query) => $query->whereHas(
                'variants',
                fn ($q) => $q->whereIn('material', $filters['materials'])
            ))
            ->when(!empty($filters['print_areas']), fn ($query) => $query->whereHas(
                'variants',
                fn ($q) => $q->where(function ($qq) use ($filters) {
                    foreach ($filters['print_areas'] as $area) {
                        $qq->orWhereJsonContains('print_areas', $area);
                    }
                })
            ));

        return $this->applySort($query, $filters['sort'] ?? 'terbaru')->paginate($perPage);
    }

    /**
     * Sidebar filter facets: every option the FE can render a checkbox/range
     * for, scoped to active products, so filters never show a dead-end
     * combination. `$lang` picks the bilingual category name the same way
     * CategoryResource does (NFR-008).
     *
     * @return array{categories: array<int, array{slug: string, name: string}>, genders: array<int, string>, sizes: array<int, string>, colors: array<int, string>, materials: array<int, string>, print_areas: array<int, string>, price_min: float, price_max: float}
     */
    public function filterOptions(string $lang = 'id'): array
    {
        $variantValues = ProductVariant::query()
            ->whereHas('product', fn ($q) => $q->active())
            ->get(['size', 'color', 'material', 'print_areas']);

        $priceRange = Product::query()->active()->selectRaw('min(base_price) as min, max(base_price) as max')->first();

        $categories = Category::query()
            ->where('categories.type', 'product')
            ->whereHas('products', fn ($q) => $q->active())
            ->orderBy("categories.name_{$lang}")
            ->get(['categories.slug as slug', "categories.name_{$lang} as name"]);

        $genders = Product::query()
            ->active()
            ->whereNotNull('gender_segment')
            ->distinct()
            ->pluck('gender_segment');

        return [
            'categories' => $categories->map(fn ($c) => ['slug' => $c->slug, 'name' => $c->name])->all(),
            'genders' => $genders->sort()->values()->all(),
            'sizes' => $variantValues->pluck('size')->unique()->sort()->values()->all(),
            'colors' => $variantValues->pluck('color')->unique()->sort()->values()->all(),
            'materials' => $variantValues->pluck('material')->unique()->sort()->values()->all(),
            'print_areas' => $variantValues->pluck('print_areas')->filter()->flatten()->unique()->sort()->values()->all(),
            'price_min' => (float) ($priceRange->min ?? 0),
            'price_max' => (float) ($priceRange->max ?? 0),
        ];
    }

    /**
     * 'terlaris' sums order_items.quantity through variants, excluding
     * cancelled/rejected orders. 'rating' averages reviews left on this
     * product's order items. Eloquent's withSum/withAvg don't support
     * dot-chained nested relations (only withCount does), so these are
     * hand-rolled correlated subqueries instead.
     */
    private function applySort(Builder $query, string $sort): Builder
    {
        return match ($sort) {
            'harga_asc' => $query->orderBy('base_price'),
            'harga_desc' => $query->orderByDesc('base_price'),
            'terlaris' => $query
                ->addSelect(['sold_count' => OrderItem::query()
                    ->selectRaw('coalesce(sum(order_items.quantity), 0)')
                    ->join('product_variants', 'product_variants.id', '=', 'order_items.product_variant_id')
                    ->join('orders', 'orders.id', '=', 'order_items.order_id')
                    ->whereColumn('product_variants.product_id', 'products.id')
                    ->whereNotIn('orders.status', ['dibatalkan', 'ditolak']),
                ])
                ->orderByDesc('sold_count'),
            'rating' => $query
                ->addSelect(['avg_rating' => Review::query()
                    ->selectRaw('avg(reviews.rating)')
                    ->join('order_items', 'order_items.id', '=', 'reviews.order_item_id')
                    ->join('product_variants', 'product_variants.id', '=', 'order_items.product_variant_id')
                    ->whereColumn('product_variants.product_id', 'products.id'),
                ])
                ->orderByDesc('avg_rating'),
            default => $query->latest(),
        };
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
