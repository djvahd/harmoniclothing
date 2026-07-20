<?php

namespace Database\Seeders;

use App\Models\NotificationSetting;
use Illuminate\Database\Seeder;

/**
 * Seeds one row per notification_type actually used by
 * NotificationService::notify() call sites (order.*, design.*, creator.*,
 * chat.message) so Admin's Konfigurasi Notifikasi page has something to
 * show/toggle - without a row present, notify() never finds a disabled
 * setting to block on, so functionality wasn't broken, but the config UI
 * was permanently empty (found via live browser testing 2026-07-20).
 */
class NotificationSettingSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
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

        foreach ($types as $type) {
            NotificationSetting::query()->firstOrCreate(['notification_type' => $type]);
        }
    }
}
