<?php

namespace App\Http\Resources;

use App\Models\User;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'photo_url' => $this->photo_path
                ? app(FileUploadService::class)->url($this->photo_path)
                : null,
            'role' => $this->role->value,
            'status' => $this->status->value,
            'email_verified_at' => $this->email_verified_at,
            // Only on GET /admin/users (relation eager-loaded): lets the admin UI tell creators apart from customers.
            'creator_status' => $this->whenLoaded('creatorProfile', fn () => $this->creatorProfile?->status),
        ];
    }
}
