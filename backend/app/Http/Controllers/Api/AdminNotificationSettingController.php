<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\NotificationSettingRequest;
use App\Http\Resources\NotificationSettingResource;
use App\Models\NotificationSetting;
use Illuminate\Http\JsonResponse;

/** GET/PATCH /admin/notification-settings — FE-038. */
class AdminNotificationSettingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => NotificationSettingResource::collection(NotificationSetting::all())]);
    }

    /** Upserts by type — a type with no row yet can be disabled on first touch. */
    public function update(NotificationSettingRequest $request, string $type): JsonResponse
    {
        $setting = NotificationSetting::query()->updateOrCreate(
            ['notification_type' => $type],
            ['is_enabled' => $request->boolean('is_enabled')],
        );

        return response()->json(['data' => new NotificationSettingResource($setting)]);
    }
}
