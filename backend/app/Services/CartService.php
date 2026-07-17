<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Models\User;
use App\Repositories\CartRepository;
use Illuminate\Database\Eloquent\Collection;

/** FE-025 Keranjang Belanja. */
class CartService
{
    public function __construct(
        private readonly CartRepository $cart,
        private readonly PricingService $pricing,
    ) {}

    public function list(User $user): Collection
    {
        return $this->cart->forUser($user);
    }

    /** BR-025: price is snapshotted here, at add-to-cart time — never recomputed on read. */
    public function add(User $user, array $data): CartItem
    {
        $variant = ProductVariant::query()->findOrFail($data['product_variant_id']);

        return $this->cart->create([
            ...$data,
            'user_id' => $user->id,
            'unit_price_snapshot' => $this->pricing->unitPriceFor($variant),
        ]);
    }

    public function update(CartItem $item, array $data): CartItem
    {
        return $this->cart->update($item, $data);
    }

    public function remove(CartItem $item): void
    {
        $this->cart->delete($item);
    }
}
