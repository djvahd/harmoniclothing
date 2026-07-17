<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreatorVerificationRequest;
use App\Services\CreatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §5 — become-creator (FR-041) & verification (FR-035/BR-008). */
class CreatorController extends Controller
{
    public function __construct(private readonly CreatorService $creators) {}

    /** POST /account/become-creator */
    public function becomeCreator(Request $request): JsonResponse
    {
        $profile = $this->creators->becomeCreator($request->user());

        return response()->json(['data' => ['slug' => $profile->slug, 'status' => $profile->status]], 201);
    }

    /** POST /creator/verification */
    public function verification(CreatorVerificationRequest $request): JsonResponse
    {
        $profile = $this->creators->submitVerification($request->user(), $request->validated());

        return response()->json(['data' => ['status' => $profile->status]]);
    }

    /** GET /creator/dashboard — FE-020, requires creator.active middleware. */
    public function dashboard(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->creators->dashboard($request->user())]);
    }
}
