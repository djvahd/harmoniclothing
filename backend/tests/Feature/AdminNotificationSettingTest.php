<?php

namespace Tests\Feature;

use App\Models\NotificationSetting;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Admin notification settings — FE-038. */
class AdminNotificationSettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_access_notification_settings(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/notification-settings')->assertForbidden();
    }

    public function test_admin_can_list_configured_settings(): void
    {
        $admin = User::factory()->admin()->create();
        NotificationSetting::factory()->create(['notification_type' => 'chat.message']);

        $response = $this->actingAs($admin)->getJson('/api/admin/notification-settings');

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_admin_can_disable_a_type_not_yet_configured(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->patchJson('/api/admin/notification-settings/order.rejected', [
            'is_enabled' => false,
        ]);

        $response->assertOk()->assertJsonPath('data.is_enabled', false);
        $this->assertDatabaseHas('notification_settings', [
            'notification_type' => 'order.rejected',
            'is_enabled' => false,
        ]);
    }

    /** The gate NotificationService::notify() checks before creating/broadcasting. */
    public function test_disabled_type_suppresses_the_notification(): void
    {
        NotificationSetting::factory()->create(['notification_type' => 'test.suppressed', 'is_enabled' => false]);
        $user = User::factory()->create();

        $notification = app(NotificationService::class)->notify($user, 'test.suppressed', 'Title', 'Body');

        $this->assertNull($notification);
        $this->assertDatabaseCount('notifications', 0);
    }
}
