<?php

namespace App\Services;

use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\NotificationSetting;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

/** FR-029 — in-app real-time notifications (BR-027: no email/SMS in MVP). */
class NotificationService
{
    /**
     * FE-038: a type explicitly disabled in notification_settings is
     * skipped. A type with no row (the vast majority — see every existing
     * call site) defaults to enabled, so this is additive, not a behavior
     * change for anything already firing.
     */
    public function notify(User $user, string $type, string $title, string $body, ?Model $related = null, ?array $params = null): ?Notification
    {
        if (NotificationSetting::query()->where('notification_type', $type)->where('is_enabled', false)->exists()) {
            return null;
        }

        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'params' => $params,
            'related_type' => $related ? $related::class : null,
            'related_id' => $related?->getKey(),
        ]);

        broadcast(new NotificationCreated($notification));

        return $notification;
    }

    public function listFor(User $user, int $perPage): LengthAwarePaginator
    {
        return $user->notifications()->latest()->latest('id')->paginate($perPage);
    }

    public function markRead(Notification $notification): Notification
    {
        $notification->update(['is_read' => true]);

        return $notification;
    }
}
