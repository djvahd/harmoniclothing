<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\NotificationSettingRequest;
use App\Http\Resources\NotificationSettingResource;
use App\Models\NotificationSetting;
use App\Services\NotificationSettingService;
use Illuminate\Http\JsonResponse;

/** GET/PATCH /admin/notification-settings — FE-038. */
class AdminNotificationSettingController extends Controller
{
    public function __construct(private readonly NotificationSettingService $settings) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => NotificationSettingResource::collection(NotificationSetting::all())]);
    }

    public function update(NotificationSettingRequest $request, string $type): JsonResponse
    {
        // Only the known (seeded) types can be toggled; an unknown type used to
        // answer 200 and silently create a junk row.
        abort_unless(in_array($type, NotificationSetting::TYPES, true), 404);

        $setting = $this->settings->update($type, $request->boolean('is_enabled'), $request->user());

        return response()->json(['data' => new NotificationSettingResource($setting)]);
    }
}
