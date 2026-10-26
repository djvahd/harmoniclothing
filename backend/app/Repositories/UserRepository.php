<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserRepository
{
    public function create(array $attributes): User
    {
        return User::create($attributes);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /** GET /admin/users — FR-030, optionally filtered by role/status. */
    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        return User::query()
            ->with('creatorProfile:id,user_id,status')
            ->when($filters['role'] ?? null, fn ($query, $role) => $role === 'creator'
                ? $query->whereHas('creatorProfile', fn ($q) => $q->whereIn('status', ['aktif', 'nonaktif', 'banned']))
                : $query->where('role', $role))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(
                fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")
            ))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->latest()->latest('id')
            ->paginate($perPage);
    }
}
