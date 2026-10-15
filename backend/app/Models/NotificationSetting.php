<?php

namespace App\Models;

use Database\Factories\NotificationSettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/** FE-038 — notification_settings (per-type on/off switch). */
#[Fillable(['notification_type', 'is_enabled'])]
class NotificationSetting extends Model
{
    /** @use HasFactory<NotificationSettingFactory> */
    use HasFactory;

    /** Every notification_type NotificationService::notify() is called with; anything else is not configurable. */
    public const TYPES = [
        'order.paid',
        'order.rejected',
        'order.shipped',
        'order.delivered',
        'design.approved',
        'design.rejected',
        'creator.approved',
        'creator.rejected',
        'creator.banned',
        'chat.message',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
        ];
    }
}
