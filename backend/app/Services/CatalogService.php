<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

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
}
