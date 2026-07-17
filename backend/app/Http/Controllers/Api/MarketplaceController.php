<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DesignIndexRequest;
use App\Http\Resources\DesignResource;
use App\Services\MarketplaceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §3 — /marketplace/designs (FE-008/009/010). Public, read-only. */
class MarketplaceController extends Controller
{
    public function __construct(private readonly MarketplaceService $marketplace) {}

    /** GET /marketplace/designs */
    public function index(DesignIndexRequest $request): JsonResponse
    {
        $designs = $this->marketplace->listDesigns(
            $request->validated('category'),
            $request->validated('search'),
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

    /** GET /marketplace/designs/{slug} — Detail Desain */
    public function show(Request $request, string $slug): JsonResponse
    {
        $design = $this->marketplace->findDesign($slug);

        abort_if(! $design, 404);

        return response()->json(['data' => new DesignResource($design)]);
    }
}
