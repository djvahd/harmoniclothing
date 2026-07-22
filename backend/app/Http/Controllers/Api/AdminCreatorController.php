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
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** 5.2_API_List.md §6 — Creator approval queue (BR-001/008/019/020/023). */
class AdminCreatorController extends Controller
{
    public function __construct(private readonly CreatorService $creators) {}

    /** GET /admin/creators/pending */
    public function pending(): JsonResponse
    {
        return response()->json(['data' => AdminCreatorProfileResource::collection($this->creators->pending())]);
    }

    /**
     * GET /admin/creators/{creatorProfile}/kyc-document — streams the KTP
     * photo from the private disk. Never given a public URL (sensitive ID
     * document); only Admin can reach this route (admin middleware group).
     */
    public function kycDocument(CreatorProfile $creatorProfile): StreamedResponse
    {
        abort_if(! $creatorProfile->ktp_photo_path, 404);
        abort_if(! Storage::disk('local')->exists($creatorProfile->ktp_photo_path), 404);

        return Storage::disk('local')->response($creatorProfile->ktp_photo_path);
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
        $profile = $this->creators->reject($creatorProfile, $request->user(), $request->validated('reason'));

        return response()->json(['data' => new AdminCreatorProfileResource($profile)]);
    }

    /** POST /admin/creators/{creatorProfile}/ban — BR-019/020/023. */
    public function ban(BanCreatorRequest $request, CreatorProfile $creatorProfile): JsonResponse
    {
        $profile = $this->creators->ban(
            $creatorProfile,
            $request->user(),
            $request->validated('reason'),
            $request->boolean('copyright_violation'),
        );

        return response()->json(['data' => new AdminCreatorProfileResource($profile)]);
    }
}
