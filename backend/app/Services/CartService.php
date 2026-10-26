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

        // Same variant + design + position + notes is one line: bump its quantity instead of duplicating the row.
        $existing = $user->cartItems()
            ->where('product_variant_id', $variant->id)
            ->where('design_id', $data['design_id'] ?? null)
            ->where('custom_design_file_path', $data['custom_design_file_path'] ?? null)
            ->where('notes', $data['notes'] ?? null)
            ->get()
            ->first(fn (CartItem $row) => json_encode($row->design_position) === json_encode($data['design_position'] ?? null));

        if ($existing) {
            return $this->cart->update($existing, ['quantity' => $existing->quantity + $data['quantity']]);
        }

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
