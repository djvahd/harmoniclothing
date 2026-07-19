<?php

namespace App\Services;

use App\Models\NotificationSetting;
use App\Models\User;

/** GET/PATCH /admin/notification-settings — FE-038. 2.5_Permission_Matrix.md §10: config changes are audited. */
class NotificationSettingService
{
    public function __construct(private readonly AuditLogService $auditLog) {}

    /** Upserts by type — a type with no row yet can be disabled/enabled on first touch. */
    public function update(string $type, bool $isEnabled, User $admin): NotificationSetting
    {
        $setting = NotificationSetting::query()->updateOrCreate(
            ['notification_type' => $type],
            ['is_enabled' => $isEnabled],
        );

        $this->auditLog->record($admin, 'notification_setting.update', $setting, "is_enabled: {$isEnabled}");

        return $setting;
    }
}
