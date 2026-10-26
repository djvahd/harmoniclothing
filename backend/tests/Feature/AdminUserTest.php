<?php

namespace Tests\Feature;

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
}
