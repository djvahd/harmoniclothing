<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReasonRequest;
use App\Http\Resources\DesignResource;
use App\Models\Design;
use App\Services\CreatorDesignService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §6 — Design approval queue (FR-025, BR-002/028). */
class AdminDesignController extends Controller
{
    public function __construct(private readonly CreatorDesignService $designs) {}

    /** GET /admin/designs/pending — FR-025. */
    public function pending(): JsonResponse
    {
        return response()->json(['data' => DesignResource::collection($this->designs->pending())]);
    }

    /** POST /admin/designs/{design}/approve — BR-002. */
    public function approve(Request $request, Design $design): JsonResponse
    {
        $design = $this->designs->approve($design, $request->user());

        return response()->json(['data' => new DesignResource($design)]);
    }

    /** POST /admin/designs/{design}/reject — reason wajib, BR-028. */
    public function reject(ReasonRequest $request, Design $design): JsonResponse
    {
        $design = $this->designs->reject($design, $request->user(), $request->validated('reason'));

        return response()->json(['data' => new DesignResource($design)]);
    }
}
