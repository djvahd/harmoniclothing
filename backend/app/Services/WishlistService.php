<?php

namespace App\Services;

use App\Models\User;
use App\Models\Wishlist;
use App\Repositories\WishlistRepository;
use Illuminate\Database\Eloquent\Collection;

/** FE-030 Wishlist. */
class WishlistService
{
    public function __construct(private readonly WishlistRepository $wishlists) {}

    public function list(User $user): Collection
    {
        return $this->wishlists->forUser($user);
    }

    public function add(User $user, array $data): Wishlist
    {
        return $this->wishlists->create([...$data, 'user_id' => $user->id]);
    }

    public function remove(Wishlist $wishlist): void
    {
        $this->wishlists->delete($wishlist);
    }
}
