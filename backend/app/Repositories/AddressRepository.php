<?php

namespace App\Repositories;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class AddressRepository
{
    public function forUser(User $user): Collection
    {
        return $user->addresses()->latest()->get();
    }

    public function create(array $attributes): Address
    {
        return Address::create($attributes);
    }

    public function update(Address $address, array $attributes): Address
    {
        $address->update($attributes);

        return $address;
    }

    public function delete(Address $address): void
    {
        $address->delete();
    }

    public function clearDefaultForUser(User $user, ?int $exceptId = null): void
    {
        $user->addresses()
            ->where('is_default', true)
            ->when($exceptId, fn ($query) => $query->whereNot('id', $exceptId))
            ->update(['is_default' => false]);
    }

    public function promoteMostRecentAsDefault(User $user): void
    {
        $address = $user->addresses()->latest()->first();
        $address?->update(['is_default' => true]);
    }
}
