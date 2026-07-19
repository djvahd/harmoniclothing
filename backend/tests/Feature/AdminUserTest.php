<?php

namespace Tests\Feature;

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
}
