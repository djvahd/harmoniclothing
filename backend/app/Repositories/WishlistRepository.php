<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Database\Eloquent\Collection;

class WishlistRepository
{
    public function forUser(User $user): Collection
    {
        return $user->wishlists()->with(['product', 'design'])->latest()->get();
    }

    public function create(array $attributes): Wishlist
    {
        return Wishlist::create($attributes);
    }

    public function delete(Wishlist $wishlist): void
    {
        $wishlist->delete();
    }
}
