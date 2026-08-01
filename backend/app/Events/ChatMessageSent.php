<?php

namespace App\Events;

use App\Http\Resources\ChatMessageResource;
use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * FR-028/041: pushes a new chat message to whoever has the thread open
 * (routes/channels.php: chat.{threadId}). ShouldBroadcastNow, not
 * ShouldBroadcast — no queue worker runs in this stack (see NotificationCreated).
 */
class ChatMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public ChatMessage $message) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("chat.{$this->message->thread_id}"),
            // So the admin thread list (FE-041) updates even when the admin
            // has a different (or no) thread open.
            new PrivateChannel('admin.chat'),
        ];
    }

    public function broadcastWith(): array
    {
        return (new ChatMessageResource($this->message->loadMissing('sender')))->resolve();
    }

    public function broadcastAs(): string
    {
        return 'chat.message.sent';
    }
}
