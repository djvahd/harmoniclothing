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

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
        ];
    }
}
