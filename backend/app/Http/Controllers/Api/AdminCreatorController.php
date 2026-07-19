<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BanCreatorRequest;
use App\Http\Requests\ReasonRequest;
use App\Http\Resources\AdminCreatorProfileResource;
use App\Models\CreatorProfile;
use App\Services\CreatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §6 — Creator approval queue (BR-001/008/019/020/023). */
class AdminCreatorController extends Controller
{
    public function __construct(private readonly CreatorService $creators) {}

    /** GET /admin/creators/pending */
    public function pending(): JsonResponse
    {
        return response()->json(['data' => AdminCreatorProfileResource::collection($this->creators->pending())]);
    }

    /** POST /admin/creators/{creatorProfile}/approve — BR-001/008. */
    public function approve(Request $request, CreatorProfile $creatorProfile): JsonResponse
    {
        $profile = $this->creators->approve($creatorProfile, $request->user());

        return response()->json(['data' => new AdminCreatorProfileResource($profile)]);
    }

    /** POST /admin/creators/{creatorProfile}/reject */
    public function reject(ReasonRequest $request, CreatorProfile $creatorProfile): JsonResponse
    {
        $profile = $this->creators->reject($creatorProfile, $request->validated('reason'));

        return response()->json(['data' => new AdminCreatorProfileResource($profile)]);
    }

    /** POST /admin/creators/{creatorProfile}/ban — BR-019/020/023. */
    public function ban(BanCreatorRequest $request, CreatorProfile $creatorProfile): JsonResponse
    {
        $profile = $this->creators->ban(
            $creatorProfile,
            $request->validated('reason'),
            $request->boolean('copyright_violation'),
        );

        return response()->json(['data' => new AdminCreatorProfileResource($profile)]);
    }
}
