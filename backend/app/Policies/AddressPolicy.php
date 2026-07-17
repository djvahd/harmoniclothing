<?php

namespace App\Policies;

use App\Models\Address;
use App\Models\User;

/**
 * 5.2_API_List.md §2 — /account/addresses/* is scope `own` (2.5 Permission
 * Matrix §7): a user may only view/modify/delete their own addresses.
 */
class AddressPolicy
{
    public function update(User $user, Address $address): bool
    {
        return $user->id === $address->user_id;
    }

    public function delete(User $user, Address $address): bool
    {
        return $user->id === $address->user_id;
    }
}
