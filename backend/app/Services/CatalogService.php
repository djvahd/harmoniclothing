<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Repositories\ProductRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CatalogService
{
    public function __construct(private readonly ProductRepository $products) {}

    /** GET /catalog/products — FE-012. */
    public function listProducts(?string $categorySlug, int $perPage): LengthAwarePaginator
    {
        return $this->products->paginate($categorySlug, $perPage);
    }

    /** GET /catalog/products/{slug} — FE-013, termasuk variants. */
    public function findProduct(string $slug): ?Product
    {
        return $this->products->findBySlug($slug);
    }

    /** POST /admin/catalog/products — FR-031. */
    public function createProduct(array $data): Product
    {
        return Product::create([
            ...$data,
            'slug' => $this->generateProductSlug($data['name_id']),
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    /** PATCH /admin/catalog/products/{id}. */
    public function updateProduct(Product $product, array $data): Product
    {
        $product->update([
            ...$data,
            'is_active' => $data['is_active'] ?? $product->is_active,
        ]);

        return $product;
    }

    /** POST /admin/catalog/products/{product}/variants — FE-046 (gap-filled). */
    public function createVariant(Product $product, array $data): ProductVariant
    {
        $this->assertVariantCombinationIsFree($product, $data['color'], $data['size'], $data['cut_type']);

        return $product->variants()->create([
            ...$data,
            'price_modifier' => $data['price_modifier'] ?? 0,
        ]);
    }

    /** PATCH /admin/catalog/variants/{variant} — FE-046 (gap-filled). */
    public function updateVariant(ProductVariant $variant, array $data): ProductVariant
    {
        $this->assertVariantCombinationIsFree($variant->product, $data['color'], $data['size'], $data['cut_type'], ignoreId: $variant->id);

        $variant->update([
            ...$data,
            'price_modifier' => $data['price_modifier'] ?? $variant->price_modifier,
        ]);

        return $variant;
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

    private function generateProductSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 1;

        while (Product::query()->where('slug', $slug)->exists()) {
            $slug = "{$base}-".$suffix++;
        }

        return $slug;
    }
}
