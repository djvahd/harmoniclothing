<?php

namespace App\Services;

use App\DTO\CheckoutDTO;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\User;
use App\Repositories\OrderRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * FE-027/052/056 checkout. Creates the order up to status="belum_dibayar"
 * (2.3_User_Flow.md line 223) — actual Midtrans Snap API call / redirect
 * URL is the separate, later Payment roadmap module (FE-032); building it
 * here would couple this module to one that doesn't exist yet.
 */
class CheckoutService
{
    public function __construct(
        private readonly OrderRepository $orders,
        private readonly PricingService $pricing,
    ) {}

    /**
     * POST /checkout — FR-017, FR-040/044, BR-012/026.
     *
     * BR-012: when the cart's total quantity qualifies for a bulk pricing
     * tier, that tiered price-per-unit applies to every item instead of
     * each item's regular cart-time snapshot (BR-025) — there's no separate
     * "bulk checkout" flow, the discount just applies automatically.
     */
    public function checkout(User $user, CheckoutDTO $dto): Order
    {
        $items = $this->fetchAndValidateCartItems($user, $dto->cartItemIds);
        $totalQuantity = $items->sum('quantity');
        $bulkUnitPrice = $this->pricing->bulkUnitPriceFor($totalQuantity);

        $subtotal = $bulkUnitPrice !== null
            ? bcmul($bulkUnitPrice, (string) $totalQuantity, 2)
            : $items->reduce(fn ($carry, CartItem $item) => bcadd($carry, $item->subtotal(), 2), '0');

        return DB::transaction(function () use ($user, $dto, $items, $subtotal, $bulkUnitPrice) {
            $order = $this->orders->create([
                'user_id' => $user->id,
                'address_id' => $dto->addressId,
                'type' => 'reguler',
                'status' => 'belum_dibayar',
                'notes' => $dto->notes,
                'subtotal' => $subtotal,
                'shipping_cost' => 0, // Shipping module (Biteship) not built yet
                'total' => $subtotal,
            ]);

            $this->orders->addItems($order, $items->map(fn (CartItem $item) => [
                'product_variant_id' => $item->product_variant_id,
                'design_id' => $item->design_id,
                'custom_design_file_path' => $item->custom_design_file_path,
                'design_position' => $item->design_position,
                'quantity' => $item->quantity,
                // BR-025: carry the locked-in cart price, unless a bulk tier overrides it.
                'unit_price' => $bulkUnitPrice ?? $item->unit_price_snapshot,
                'subtotal' => $bulkUnitPrice !== null
                    ? bcmul($bulkUnitPrice, (string) $item->quantity, 2)
                    : $item->subtotal(),
            ])->all());

            $this->orders->recordStatusHistory($order, null, 'belum_dibayar', 'customer', $user->id);

            $items->each(fn (CartItem $item) => $item->delete());

            return $order->load('items.productVariant.product', 'items.design');
        });
    }

    /**
     * 2.3_User_Flow.md line 221: "Semua item di keranjang valid (stok bahan
     * tersedia) → lanjut ke halaman pembayaran" — rejects checkout if any
     * selected item's product has since been deactivated.
     */
    private function fetchAndValidateCartItems(User $user, array $cartItemIds)
    {
        $items = $user->cartItems()
            ->with('productVariant.product')
            ->whereIn('id', $cartItemIds)
            ->get();

        $unavailable = $items->first(fn (CartItem $item) => ! $item->productVariant->product->is_active);

        if ($unavailable) {
            throw ValidationException::withMessages([
                'cart_item_ids' => ['Salah satu item di keranjang sudah tidak tersedia.'],
            ]);
        }

        return $items;
    }
}
