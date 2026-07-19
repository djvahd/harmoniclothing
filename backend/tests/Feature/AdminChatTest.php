<?php

namespace Tests\Feature;

use App\Models\ChatThread;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Admin chat management — FE-041. */
class AdminChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_access_admin_chat_threads(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/chat/threads')->assertForbidden();
    }

    public function test_admin_sees_all_threads_with_customer_name(): void
    {
        $admin = User::factory()->admin()->create();
        $thread = ChatThread::factory()->create();

        $response = $this->actingAs($admin)->getJson('/api/admin/chat/threads');

        $response->assertOk()->assertJsonPath('data.0.customer.name', $thread->customer->name);
    }

    public function test_admin_reply_auto_assigns_the_thread(): void
    {
        $admin = User::factory()->admin()->create();
        $thread = ChatThread::factory()->create();

        $response = $this->actingAs($admin)->postJson("/api/admin/chat/threads/{$thread->id}/messages", [
            'message' => 'Halo, ada yang bisa kami bantu?',
        ]);

        $response->assertCreated();
        $this->assertSame($admin->id, $thread->fresh()->assigned_admin_id);
    }

    public function test_admin_can_read_thread_messages(): void
    {
        $admin = User::factory()->admin()->create();
        $thread = ChatThread::factory()->create();
        $this->actingAs($thread->customer)->postJson("/api/chat/threads/{$thread->id}/messages", [
            'message' => 'Halo Admin',
        ]);

        $response = $this->actingAs($admin)->getJson("/api/admin/chat/threads/{$thread->id}/messages");

        $response->assertOk()->assertJsonCount(1, 'data');
    }
}
