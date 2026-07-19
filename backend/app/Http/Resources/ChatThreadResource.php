<?php

namespace App\Http\Resources;

use App\Models\ChatThread;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ChatThread */
class ChatThreadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'assigned_admin_id' => $this->assigned_admin_id,
            'last_message_at' => $this->last_message_at,
        ];
    }
}
