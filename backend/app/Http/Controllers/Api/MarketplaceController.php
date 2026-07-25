<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreatorIndexRequest;
use App\Http\Requests\DesignIndexRequest;
use App\Http\Resources\CreatorProfileResource;
use App\Http\Resources\CreatorSummaryResource;
use App\Http\Resources\DesignResource;
use App\Http\Resources\ResolvesLocale;
use App\Services\MarketplaceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §3 — /marketplace/designs (FE-008/009/010). Public, read-only. */
class MarketplaceController extends Controller
{
    use ResolvesLocale;

    public function __construct(private readonly MarketplaceService $marketplace) {}

    /** GET /marketplace/designs */
    public function index(DesignIndexRequest $request): JsonResponse
    {
        $designs = $this->marketplace->listDesigns(
            $request->safe()->only(['categories', 'tags', 'search', 'price_min', 'price_max', 'sort']),
            (int) $request->validated('per_page', 20)
        );

        return response()->json([
            'data' => DesignResource::collection($designs)->toArray($request),
            'meta' => [
                'current_page' => $designs->currentPage(),
                'per_page' => $designs->perPage(),
                'total' => $designs->total(),
            ],
        ]);
    }

    /** GET /marketplace/designs/filters — sidebar facets for the Marketplace Desain filter panel. */
    public function designFilters(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->marketplace->getDesignFilterOptions($this->locale($request))]);
    }

    /** GET /marketplace/designs/{slug} — Detail Desain */
    public function show(Request $request, string $slug): JsonResponse
    {
        $design = $this->marketplace->findDesign($slug);

        abort_if(! $design, 404);

        return response()->json(['data' => new DesignResource($design)]);
    }

    /** GET /marketplace/creators — Creator tab of Marketplace Desain. */
    public function indexCreators(CreatorIndexRequest $request): JsonResponse
    {
        $creators = $this->marketplace->listCreators(
            $request->validated('search'),
            $request->validated('categories', []),
            $request->validated('sort', 'terbaru'),
            (int) $request->validated('per_page', 20)
        );

        return response()->json([
            'data' => CreatorSummaryResource::collection($creators)->toArray($request),
            'meta' => [
                'current_page' => $creators->currentPage(),
                'per_page' => $creators->perPage(),
                'total' => $creators->total(),
            ],
        ]);
    }

    /** GET /marketplace/creators/{slug} — FE-011 public creator profile. */
    public function showCreator(Request $request, string $slug): JsonResponse
    {
        $creator = $this->marketplace->findCreator($slug);

        abort_if(! $creator, 404);

        return response()->json(['data' => new CreatorProfileResource($creator)]);
    }
}
