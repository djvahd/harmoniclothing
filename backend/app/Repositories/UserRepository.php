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
            ->when($filters['role'] ?? null, fn ($query, $role) => $query->where('role', $role))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate($perPage);
    }
}
