<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §4 — /notifications (FR-029), scope own. */
class NotificationController extends Controller
{
    public function __construct(private readonly NotificationService $notifications) {}

    /** GET /notifications */
    public function index(Request $request): JsonResponse
    {
        $notifications = $this->notifications->listFor($request->user(), (int) $request->query('per_page', 20));

        return response()->json([
            'data' => NotificationResource::collection($notifications),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    /** PATCH /notifications/{notification}/read — scoped to the user's own notifications. */
    public function markRead(Request $request, int $notification): JsonResponse
    {
        $notification = $request->user()->notifications()->findOrFail($notification);
        $notification = $this->notifications->markRead($notification);

        return response()->json(['data' => new NotificationResource($notification)]);
    }
}
