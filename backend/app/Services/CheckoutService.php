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

    /** POST /checkout — FR-017. */
    public function checkout(User $user, CheckoutDTO $dto): Order
    {
        $items = $this->fetchAndValidateCartItems($user, $dto->cartItemIds);

        $subtotal = $items->reduce(
            fn ($carry, CartItem $item) => bcadd($carry, $item->subtotal(), 2),
            '0'
        );

        return DB::transaction(function () use ($user, $dto, $items, $subtotal) {
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
                'unit_price' => $item->unit_price_snapshot, // BR-025: carry the locked-in price
                'subtotal' => $item->subtotal(),
            ])->all());

            $this->orders->recordStatusHistory($order, null, 'belum_dibayar', 'customer', $user->id);

            $items->each(fn (CartItem $item) => $item->delete());

            return $order->load('items.productVariant.product', 'items.design');
        });
    }

    /** POST /checkout/bulk — FR-040/044, BR-012/026. */
    public function checkoutBulk(User $user, CheckoutDTO $dto): Order
    {
        $items = $this->fetchAndValidateCartItems($user, $dto->cartItemIds);
        $totalQuantity = $items->sum('quantity');

        // BR-012: bulk price is tiered by *total* quantity, computed fresh
        // at checkout — unlike BR-025's cart-time lock for regular items,
        // this can't be known until all the bulk order's items are chosen.
        $unitPrice = $this->pricing->bulkUnitPriceFor($totalQuantity);

        if ($unitPrice === null) {
            throw ValidationException::withMessages([
                'cart_item_ids' => ['Tidak ada tingkat harga Bulk Order untuk kuantitas ini.'],
            ]);
        }

        $subtotal = bcmul($unitPrice, (string) $totalQuantity, 2);

        return DB::transaction(function () use ($user, $dto, $items, $subtotal, $unitPrice) {
            $order = $this->orders->create([
                'user_id' => $user->id,
                'address_id' => $dto->addressId,
                'type' => 'bulk',
                'status' => 'belum_dibayar',
                'notes' => $dto->notes,
                'subtotal' => $subtotal,
                'shipping_cost' => 0,
                'total' => $subtotal,
            ]);

            $this->orders->addItems($order, $items->map(fn (CartItem $item) => [
                'product_variant_id' => $item->product_variant_id,
                'design_id' => $item->design_id,
                'custom_design_file_path' => $item->custom_design_file_path,
                'design_position' => $item->design_position,
                'quantity' => $item->quantity,
                'unit_price' => $unitPrice,
                'subtotal' => bcmul($unitPrice, (string) $item->quantity, 2),
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
