<?php

namespace Tests\Feature;

use App\Enums\UserStatus;
use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** GET /admin/users — FR-030. */
class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_list_users(): void
    {
        $this->getJson('/api/admin/users')->assertUnauthorized();
    }

    public function test_customer_cannot_list_users(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/users')->assertForbidden();
    }

    public function test_admin_can_list_users(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->count(2)->create();

        $response = $this->actingAs($admin)->getJson('/api/admin/users');

        $response->assertOk()->assertJsonCount(3, 'data');
    }

    public function test_admin_can_filter_users_by_role(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->count(2)->create();

        $response = $this->actingAs($admin)->getJson('/api/admin/users?role=admin');

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_admin_can_search_users_and_see_creator_status(): void
    {
        $admin = User::factory()->admin()->create();
        $creator = User::factory()->create(['name' => 'Sinta Creator']);
        CreatorProfile::factory()->aktif()->create(['user_id' => $creator->id]);
        User::factory()->create(['name' => 'Andi Biasa']);

        $response = $this->actingAs($admin)->getJson('/api/admin/users?search=Sinta');
        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.creator_status', 'aktif');

        $this->actingAs($admin)->getJson('/api/admin/users?role=creator')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $creator->id);
    }

    public function test_admin_can_deactivate_and_reactivate_a_user(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        $user->createToken('t');

        $this->actingAs($admin)->patchJson("/api/admin/users/{$user->id}/status", ['status' => 'nonaktif'])
            ->assertOk()->assertJsonPath('data.status', 'nonaktif');
        $this->assertSame(UserStatus::Nonaktif, $user->fresh()->status);
        $this->assertSame(0, $user->tokens()->count());
        $this->assertDatabaseHas('audit_logs', ['actor_id' => $admin->id, 'action' => 'user.deactivate']);

        $this->actingAs($admin)->patchJson("/api/admin/users/{$user->id}/status", ['status' => 'aktif'])
            ->assertOk()->assertJsonPath('data.status', 'aktif');
        $this->assertDatabaseHas('audit_logs', ['actor_id' => $admin->id, 'action' => 'user.activate']);
    }

    public function test_deactivated_user_loses_access(): void
    {
        $user = User::factory()->create();
        $user->forceFill(['status' => UserStatus::Nonaktif])->save();

        $this->actingAs($user)->patchJson('/api/account/profile', ['name' => 'X'])->assertForbidden();
    }

    public function test_admin_cannot_deactivate_self_or_another_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $other = User::factory()->admin()->create();

        $this->actingAs($admin)->patchJson("/api/admin/users/{$admin->id}/status", ['status' => 'nonaktif'])->assertForbidden();
        $this->actingAs($admin)->patchJson("/api/admin/users/{$other->id}/status", ['status' => 'nonaktif'])->assertForbidden();
        $this->assertSame(UserStatus::Aktif, $other->fresh()->status);
    }

    public function test_status_update_rejects_invalid_value_and_banned_user(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        $banned = User::factory()->create();
        $banned->forceFill(['status' => UserStatus::Banned])->save();

        $this->actingAs($admin)->patchJson("/api/admin/users/{$user->id}/status", ['status' => 'banned'])->assertUnprocessable();
        $this->actingAs($admin)->patchJson("/api/admin/users/{$banned->id}/status", ['status' => 'aktif'])->assertUnprocessable();
    }

    public function test_customer_cannot_change_user_status(): void
    {
        $customer = User::factory()->create();
        $user = User::factory()->create();

        $this->actingAs($customer)->patchJson("/api/admin/users/{$user->id}/status", ['status' => 'nonaktif'])->assertForbidden();
    }
}
