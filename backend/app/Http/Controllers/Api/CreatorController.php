<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreatorApplicationRequest;
use App\Http\Requests\CreatorProfileUpdateRequest;
use App\Http\Requests\CreatorVerificationRequest;
use App\Http\Resources\CommissionResource;
use App\Services\CommissionService;
use App\Services\CreatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §5 — become-creator (FR-041) & verification (FR-035/BR-008). */
class CreatorController extends Controller
{
    public function __construct(
        private readonly CreatorService $creators,
        private readonly CommissionService $commissions,
    ) {}

    /** POST /account/become-creator */
    public function becomeCreator(CreatorApplicationRequest $request): JsonResponse
    {
        $profile = $this->creators->becomeCreator($request->user(), $request->validated());

        return response()->json(['data' => ['slug' => $profile->slug, 'status' => $profile->status]], 201);
    }

    /** GET /creator/verification */
    public function verificationStatus(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->creators->verificationStatus($request->user())]);
    }

    /** POST /creator/verification */
    public function verification(CreatorVerificationRequest $request): JsonResponse
    {
        $profile = $this->creators->submitVerification($request->user(), $request->validated());

        return response()->json(['data' => ['status' => $profile->status]]);
    }

    /** GET /creator/profile */
    public function profile(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->creators->profile($request->user())]);
    }

    /** PATCH /creator/profile */
    public function updateProfile(CreatorProfileUpdateRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->creators->updateProfile($request->user(), $request->validated())]);
    }

    /** GET /creator/dashboard — FE-020, requires creator.active middleware. */
    public function dashboard(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->creators->dashboard($request->user())]);
    }

    /** GET /creator/earnings — FR-026. */
    public function earnings(Request $request): JsonResponse
    {
        return response()->json([
            'data' => CommissionResource::collection($this->commissions->earningsFor($request->user())),
            'summary' => $this->commissions->summaryFor($request->user()),
        ]);
    }
}
