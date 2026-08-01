<?php

use App\Enums\UserRole;
use App\Models\ChatThread;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/** NotificationCreated broadcasts here (App\Events\NotificationCreated::broadcastOn). */
Broadcast::channel('App.Models.User.{id}', function (User $user, int $id) {
    return $user->id === $id;
});

/** ChatMessageSent broadcasts here — the thread's own customer, or any admin. */
Broadcast::channel('chat.{threadId}', function (User $user, int $threadId) {
    if ($user->role === UserRole::Admin) {
        return true;
    }

    return ChatThread::find($threadId)?->customer_id === $user->id;
});

/** Admin-only: lets the admin chat thread list (FE-041) live-update regardless of which thread is open. */
Broadcast::channel('admin.chat', function (User $user) {
    return $user->role === UserRole::Admin;
});
