<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * FR-029/BR-027: in-app real-time notification only (WebSocket via Reverb
 * for MVP — no email/SMS). Broadcasts synchronously (ShouldBroadcastNow, not
 * ShouldBroadcast) because no queue worker runs anywhere in this stack —
 * queuing it would silently pile up undelivered jobs instead of pushing.
 * Requires `php artisan reverb:start` running locally (.claude/launch.json).
 */
class NotificationCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Notification $notification) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [new PrivateChannel("App.Models.User.{$this->notification->user_id}")];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'type' => $this->notification->type,
            'title' => $this->notification->title,
            'body' => $this->notification->body,
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }
}
