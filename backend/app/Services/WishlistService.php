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
        // Idempotent: adding the same product/design twice must not create a second row.
        return $user->wishlists()->firstOrCreate([
            'product_id' => $data['product_id'] ?? null,
            'design_id' => $data['design_id'] ?? null,
        ]);
    }

    public function remove(Wishlist $wishlist): void
    {
        $this->wishlists->delete($wishlist);
    }
}
