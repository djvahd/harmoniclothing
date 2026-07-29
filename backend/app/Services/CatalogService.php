<?php

namespace App\Services;

use App\Models\BulkPricingTier;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Repositories\ProductRepository;
use App\Support\SlugGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class CatalogService
{
    public function __construct(
        private readonly ProductRepository $products,
        private readonly AuditLogService $auditLog,
    ) {}

    /**
     * GET /catalog/products — FE-012.
     *
     * @param  array{categories?: array<int,string>, genders?: array<int,string>, sizes?: array<int,string>, colors?: array<int,string>, materials?: array<int,string>, print_areas?: array<int,string>, price_min?: float, price_max?: float, sort?: string}  $filters
     */
    public function listProducts(array $filters, int $perPage): LengthAwarePaginator
    {
        return $this->products->paginate($filters, $perPage);
    }

    /** GET /catalog/products/filters — sidebar filter facets (categories, genders, sizes, colors, materials, print areas, price range). */
    public function getFilterOptions(string $lang = 'id'): array
    {
        return $this->products->filterOptions($lang);
    }

    /** GET /catalog/products/{slug} — FE-013, termasuk variants. */
    public function findProduct(string $slug): ?Product
    {
        return $this->products->findBySlug($slug);
    }

    /** GET /admin/catalog/products — admin management list (gap-filled), includes inactive products. */
    public function listProductsForAdmin(?string $categorySlug, int $perPage): LengthAwarePaginator
    {
        return $this->products->paginateForAdmin($categorySlug, $perPage);
    }

    /** POST /admin/catalog/products — FR-031. */
    public function createProduct(array $data, User $admin): Product
    {
        $product = Product::create([
            ...$data,
            'slug' => SlugGenerator::unique($data['name_id'], Product::class),
            'is_active' => $data['is_active'] ?? true,
        ]);
        $this->auditLog->record($admin, 'product.create', $product);

        return $product;
    }

    /** PATCH /admin/catalog/products/{id}. 2.5_Permission_Matrix.md §10: base_price changes are audited. */
    public function updateProduct(Product $product, array $data, User $admin): Product
    {
        $product->update([
            ...$data,
            'is_active' => $data['is_active'] ?? $product->is_active,
        ]);
        $this->auditLog->record($admin, 'product.update', $product, "base_price: {$product->base_price}");

        return $product;
    }

    /** POST /admin/catalog/products/{product}/variants — FE-046 (gap-filled). */
    public function createVariant(Product $product, array $data, User $admin): ProductVariant
    {
        $this->assertVariantCombinationIsFree($product, $data['color'], $data['size'], $data['cut_type']);

        $variant = $product->variants()->create([
            ...$data,
            'price_modifier' => $data['price_modifier'] ?? 0,
        ]);
        $this->auditLog->record($admin, 'variant.create', $variant);

        return $variant;
    }

    /** PATCH /admin/catalog/variants/{variant} — FE-046 (gap-filled). price_modifier changes are audited. */
    public function updateVariant(ProductVariant $variant, array $data, User $admin): ProductVariant
    {
        $this->assertVariantCombinationIsFree($variant->product, $data['color'], $data['size'], $data['cut_type'], ignoreId: $variant->id);

        $variant->update([
            ...$data,
            'price_modifier' => $data['price_modifier'] ?? $variant->price_modifier,
        ]);
        $this->auditLog->record($admin, 'variant.update', $variant, "price_modifier: {$variant->price_modifier}");

        return $variant;
    }

    /** POST /admin/catalog/bulk-pricing-tiers — BR-012. 2.5_Permission_Matrix.md §10: Bulk Order tier changes are audited. */
    public function createBulkPricingTier(array $data, User $admin): BulkPricingTier
    {
        $tier = BulkPricingTier::create($data);
        $this->auditLog->record($admin, 'bulk_pricing_tier.create', $tier);

        return $tier;
    }

    /** Mirrors the DB-level unique(product_id, color, size, cut_type) constraint as a 422 instead of a raw QueryException. */
    private function assertVariantCombinationIsFree(Product $product, string $color, string $size, string $cutType, ?int $ignoreId = null): void
    {
        $exists = $product->variants()
            ->where('color', $color)
            ->where('size', $size)
            ->where('cut_type', $cutType)
            ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'color' => ['Kombinasi warna/ukuran/potongan ini sudah ada untuk produk ini.'],
            ]);
        }
    }
}
