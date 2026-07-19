<?php

namespace Tests\Feature;

use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** FR-028 — Chat dengan Admin, customer side. */
class ChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_chat(): void
    {
        $this->getJson('/api/chat/threads')->assertUnauthorized();
    }

    public function test_first_visit_lazily_creates_the_customers_thread(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/chat/threads');

        $response->assertOk()->assertJsonCount(1, 'data');
        $this->assertDatabaseHas('chat_threads', ['customer_id' => $user->id]);
    }

    public function test_repeat_visits_reuse_the_same_thread(): void
    {
        $user = User::factory()->create();

        $first = $this->actingAs($user)->getJson('/api/chat/threads')->json('data.0.id');
        $second = $this->actingAs($user)->getJson('/api/chat/threads')->json('data.0.id');

        $this->assertSame($first, $second);
        $this->assertDatabaseCount('chat_threads', 1);
    }

    public function test_customer_can_send_and_list_messages_in_their_own_thread(): void
    {
        $user = User::factory()->create();
        $thread = ChatThread::factory()->for($user, 'customer')->create();

        $this->actingAs($user)
            ->postJson("/api/chat/threads/{$thread->id}/messages", ['message' => 'Halo, saya butuh bantuan.'])
            ->assertCreated()
            ->assertJsonPath('data.sender_role', 'customer');

        $this->actingAs($user)->getJson("/api/chat/threads/{$thread->id}/messages")
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->assertNotNull($thread->fresh()->last_message_at);
    }

    public function test_viewing_messages_marks_admin_messages_read(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $thread = ChatThread::factory()->for($user, 'customer')->create();
        ChatMessage::factory()->for($thread, 'thread')->for($admin, 'sender')
            ->create(['sender_role' => 'admin', 'is_read' => false]);

        $this->actingAs($user)->getJson("/api/chat/threads/{$thread->id}/messages")->assertOk();

        $this->assertTrue($thread->messages()->first()->fresh()->is_read);
    }

    public function test_customer_cannot_access_another_customers_thread(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $thread = ChatThread::factory()->for($owner, 'customer')->create();

        $this->actingAs($intruder)->getJson("/api/chat/threads/{$thread->id}/messages")->assertNotFound();
        $this->actingAs($intruder)->postJson("/api/chat/threads/{$thread->id}/messages", ['message' => 'x'])
            ->assertNotFound();
    }
}
