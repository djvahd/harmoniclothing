<?php

namespace App\Services;

use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

/** FR-029 — in-app real-time notifications (BR-027: no email/SMS in MVP). */
class NotificationService
{
    public function notify(User $user, string $type, string $title, string $body, ?Model $related = null): Notification
    {
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'related_type' => $related ? $related::class : null,
            'related_id' => $related?->getKey(),
        ]);

        broadcast(new NotificationCreated($notification));

        return $notification;
    }

    public function listFor(User $user, int $perPage): LengthAwarePaginator
    {
        return $user->notifications()->latest()->paginate($perPage);
    }

    public function markRead(Notification $notification): Notification
    {
        $notification->update(['is_read' => true]);

        return $notification;
    }
}
