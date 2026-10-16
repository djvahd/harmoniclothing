<?php

namespace App\Http\Resources;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Lang;

/** @mixin Notification */
class NotificationResource extends JsonResource
{
    /**
     * Notifications created with params are rendered in the reader's language; older rows (no params)
     * and any type without a translation keep the text stored when they were created.
     */
    private function localized(string $part, string $stored): string
    {
        $params = $this->params;
        if (! is_array($params)) {
            return $stored;
        }

        $key = 'notifications.'.($params['tkey'] ?? $this->type).'.'.$part;

        return Lang::has($key) ? __($key, collect($params)->except('tkey')->all()) : $stored;
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->localized('title', $this->title),
            'body' => $this->localized('body', $this->body),
            'is_read' => $this->is_read,
            'created_at' => $this->created_at,
        ];
    }
}
