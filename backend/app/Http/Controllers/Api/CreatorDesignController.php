<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreatorDesignRequest;
use App\Http\Requests\CreatorDesignUpdateRequest;
use App\Http\Resources\DesignResource;
use App\Services\CreatorDesignService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §5 — /creator/designs (FR-024/037), requires creator.active. */
class CreatorDesignController extends Controller
{
    public function __construct(private readonly CreatorDesignService $designs) {}

    /** GET /creator/designs */
    public function index(Request $request): JsonResponse
    {
        return response()->json(['data' => DesignResource::collection($this->designs->list($request->user()))]);
    }

    /** POST /creator/designs */
    public function store(CreatorDesignRequest $request): JsonResponse
    {
        $design = $this->designs->create($request->user(), $request->validated());

        return response()->json(['data' => new DesignResource($design)], 201);
    }

    /** PATCH /creator/designs/{design} — BR-028 revision while "ditolak". */
    public function update(CreatorDesignUpdateRequest $request, int $design): JsonResponse
    {
        $design = $request->user()->designs()->findOrFail($design);
        $design = $this->designs->update($design, $request->validated());

        return response()->json(['data' => new DesignResource($design)]);
    }

    /** POST /creator/designs/{design}/apparel/{product}/confirm — FR-037. */
    public function confirmApparel(Request $request, int $design, int $product): JsonResponse
    {
        $design = $request->user()->designs()->findOrFail($design);
        $design = $this->designs->confirmApparel($design, $product);

        return response()->json(['data' => new DesignResource($design)]);
    }

    /**
     * POST /creator/designs/{design}/submit — Flow 16. 5.3_API_Specification.md
     * §8's exact response shape for the unconfirmed-apparel case.
     */
    public function submit(Request $request, int $design): JsonResponse
    {
        $design = $request->user()->designs()->findOrFail($design);
        $unconfirmed = $this->designs->unconfirmedApparelIds($design);

        if ($unconfirmed !== []) {
            return response()->json([
                'message' => __('messages.design.unconfirmed_apparel'),
                'unconfirmed_product_ids' => $unconfirmed,
            ], 422);
        }

        $design = $this->designs->submit($design);

        return response()->json(['data' => new DesignResource($design)]);
    }
}
