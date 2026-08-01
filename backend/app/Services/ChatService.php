<?php

namespace App\Services;

use App\Events\ChatMessageSent;
use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * FR-028 Chat dengan Admin. Admin-side management (FE-041, GET/POST
 * /admin/chat/*) is out of scope here — 5.2_API_List.md §6 puts it under
 * Admin APIs, and the later Admin Dashboard module owns it.
 */
class ChatService
{
    public function __construct(private readonly NotificationService $notifications) {}

    /** GET /chat/threads — auto-creates the customer's single support thread on first access. */
    public function getOrCreateThreadFor(User $customer): ChatThread
    {
        return ChatThread::query()->firstOrCreate(['customer_id' => $customer->id]);
    }

    /** GET /chat/threads/{id}/messages — marks the other party's messages read on view. */
    public function messagesFor(ChatThread $thread, string $viewerRole): Collection
    {
        $thread->messages()
            ->where('sender_role', '!=', $viewerRole)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return $thread->messages()->with('sender')->oldest()->get();
    }

    /** GET /admin/chat/threads — FE-041, scope all. */
    public function listForAdmin(): Collection
    {
        return ChatThread::query()->with('customer')->orderByDesc('last_message_at')->get();
    }

    public function sendMessage(ChatThread $thread, User $sender, string $senderRole, string $message): ChatMessage
    {
        // FE-041: a thread is assigned to whichever admin replies first.
        if ($senderRole === 'admin' && ! $thread->assigned_admin_id) {
            $thread->update(['assigned_admin_id' => $sender->id]);
        }

        $chatMessage = $thread->messages()->create([
            'sender_id' => $sender->id,
            'sender_role' => $senderRole,
            'message' => $message,
            'is_read' => false,
        ]);

        $thread->update(['last_message_at' => now()]);

        broadcast(new ChatMessageSent($chatMessage));

        // FE-041 note: no admin is assigned to a thread until the (not yet
        // built) Admin Dashboard picks it up, so this is a no-op for now.
        if ($senderRole === 'customer' && $thread->assigned_admin_id) {
            $this->notifications->notify(
                $thread->assignedAdmin,
                'chat.message',
                'Pesan baru',
                "Pesan baru dari {$sender->name}.",
                $thread,
            );
        } elseif ($senderRole === 'admin') {
            $this->notifications->notify(
                $thread->customer,
                'chat.message',
                'Pesan baru dari Admin',
                'Anda menerima balasan baru di chat support.',
                $thread,
            );
        }

        return $chatMessage;
    }
}
