<?php

namespace App\Services;

use App\Models\Address;
use App\Models\User;
use App\Repositories\AddressRepository;
use Illuminate\Database\Eloquent\Collection;

class AccountService
{
    public function __construct(private readonly AddressRepository $addresses) {}

    /** PATCH /account/profile — FR-004. */
    public function updateProfile(User $user, array $data): User
    {
        $user->update($data);

        return $user;
    }

    /** GET /account/addresses — FR-048. */
    public function listAddresses(User $user): Collection
    {
        return $this->addresses->forUser($user);
    }

    /**
     * POST /account/addresses. First address is always the default
     * regardless of input, so checkout (FR-048) always has one to preselect.
     */
    public function createAddress(User $user, array $data): Address
    {
        $isFirst = $this->addresses->forUser($user)->isEmpty();
        $data['is_default'] = $isFirst || ($data['is_default'] ?? false);

        $address = $this->addresses->create([...$data, 'user_id' => $user->id]);

        if ($address->is_default) {
            $this->addresses->clearDefaultForUser($user, $address->id);
        }

        return $address;
    }

    public function updateAddress(Address $address, array $data): Address
    {
        $this->addresses->update($address, $data);

        if ($address->is_default) {
            $this->addresses->clearDefaultForUser($address->user, $address->id);
        }

        return $address;
    }

    /** Keeps exactly one default remaining so checkout always has one. */
    public function deleteAddress(Address $address): void
    {
        $user = $address->user;
        $wasDefault = $address->is_default;

        $this->addresses->delete($address);

        if ($wasDefault) {
            $this->addresses->promoteMostRecentAsDefault($user);
        }
    }
}
