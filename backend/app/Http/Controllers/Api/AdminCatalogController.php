<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkPricingTierRequest;
use App\Http\Requests\ProductRequest;
use App\Http\Requests\ProductVariantRequest;
use App\Http\Requests\UploadMockupFileRequest;
use App\Http\Resources\AdminProductResource;
use App\Http\Resources\BulkPricingTierResource;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\CatalogService;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §6 — Product Catalog management (FR-031, BR-012). */
class AdminCatalogController extends Controller
{
    public function __construct(
        private readonly CatalogService $catalog,
        private readonly FileUploadService $uploads,
    ) {}

    /** GET /admin/catalog/products — admin management list (gap-filled); shows inactive products too, unlike the public list. */
    public function index(Request $request): JsonResponse
    {
        $products = $this->catalog->listProductsForAdmin(
            $request->query('category'),
            (int) $request->query('per_page', 20),
        );

        return response()->json([
            'data' => AdminProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /** POST /admin/catalog/products — FR-031. */
    public function storeProduct(ProductRequest $request): JsonResponse
    {
        $product = $this->catalog->createProduct($request->validated(), $request->user());

        return response()->json(['data' => new AdminProductResource($product)], 201);
    }

    /** PATCH /admin/catalog/products/{product}. */
    public function updateProduct(ProductRequest $request, Product $product): JsonResponse
    {
        $product = $this->catalog->updateProduct($product, $request->validated(), $request->user());

        return response()->json(['data' => new AdminProductResource($product)]);
    }

    /** POST /admin/catalog/products/{product}/variants — FE-046 (gap-filled). */
    public function storeVariant(ProductVariantRequest $request, Product $product): JsonResponse
    {
        $variant = $this->catalog->createVariant($product, $request->validated(), $request->user());

        return response()->json(['data' => new ProductVariantResource($variant)], 201);
    }

    /** PATCH /admin/catalog/variants/{variant} — FE-046 (gap-filled). */
    public function updateVariant(ProductVariantRequest $request, ProductVariant $variant): JsonResponse
    {
        $variant = $this->catalog->updateVariant($variant, $request->validated(), $request->user());

        return response()->json(['data' => new ProductVariantResource($variant)]);
    }

    /** POST /admin/catalog/mockup-upload — variant mockup photo upload for the admin catalog form. */
    public function uploadMockup(UploadMockupFileRequest $request): JsonResponse
    {
        $path = $this->uploads->storeDesignFile($request->file('file'), 'mockup-uploads');

        return response()->json([
            'data' => [
                'path' => $path,
                'url' => $this->uploads->url($path),
            ],
        ]);
    }

    /** POST /admin/catalog/bulk-pricing-tiers — BR-012. */
    public function storeBulkPricingTier(BulkPricingTierRequest $request): JsonResponse
    {
        $tier = $this->catalog->createBulkPricingTier($request->validated(), $request->user());

        return response()->json(['data' => new BulkPricingTierResource($tier)], 201);
    }
}
