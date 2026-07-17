<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductIndexRequest;
use App\Http\Resources\ProductResource;
use App\Services\CatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §3 — /catalog/* (Product Catalog, FE-012/013). Public, read-only. */
class CatalogController extends Controller
{
    public function __construct(private readonly CatalogService $catalog) {}

    /** GET /catalog/products */
    public function index(ProductIndexRequest $request): JsonResponse
    {
        $products = $this->catalog->listProducts(
            $request->validated('category'),
            (int) $request->validated('per_page', 20)
        );

        return response()->json([
            'data' => ProductResource::collection($products)->toArray($request),
            'meta' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /** GET /catalog/products/{slug} */
    public function show(Request $request, string $slug): JsonResponse
    {
        $product = $this->catalog->findProduct($slug);

        abort_if(! $product, 404);

        return response()->json(['data' => new ProductResource($product)]);
    }
}
