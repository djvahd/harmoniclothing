<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * 5.6_Security_Planning.md §8 / 2.5_Permission_Matrix.md §10: every
 * sensitive Admin action (approve/reject, ban, price changes, manual
 * payment/shipment changes, notification-config changes) is recorded here.
 */
class AuditLogService
{
    public function record(User $actor, string $action, Model $entity, ?string $description = null): AuditLog
    {
        return AuditLog::create([
            'actor_id' => $actor->id,
            'action' => $action,
            'entity_type' => $entity::class,
            'entity_id' => $entity->getKey(),
            'description' => $description,
        ]);
    }
}
