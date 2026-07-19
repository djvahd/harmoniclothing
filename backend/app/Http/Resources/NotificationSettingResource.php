<?php

namespace App\Http\Resources;

use App\Models\NotificationSetting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin NotificationSetting */
class NotificationSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'notification_type' => $this->notification_type,
            'is_enabled' => $this->is_enabled,
        ];
    }
}
