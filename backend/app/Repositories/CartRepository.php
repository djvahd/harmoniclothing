<?php

namespace App\Repositories;

use App\Models\CartItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CartRepository
{
    public function forUser(User $user): Collection
    {
        return $user->cartItems()->with(['productVariant.product', 'design'])->latest()->get();
    }

    public function create(array $attributes): CartItem
    {
        return CartItem::create($attributes);
    }

    public function update(CartItem $item, array $attributes): CartItem
    {
        $item->update($attributes);

        return $item;
    }

    public function delete(CartItem $item): void
    {
        $item->delete();
    }
}
