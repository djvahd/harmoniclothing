<?php

namespace App\Services;

use App\DTO\BulkCheckoutDTO;
use App\DTO\CheckoutDTO;
use App\Models\Address;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use App\Repositories\OrderRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * FE-027/052/056 checkout. Creates the order up to status="belum_dibayar"
 * (2.3_User_Flow.md line 223) — actual Midtrans Snap API call / redirect
 * URL happens after, in CheckoutController::respondWithPayment().
 *
 * Shipping cost is re-derived from Biteship server-side using the courier
 * the customer picked (see BiteshipService::rateFor()) — never trusted from
 * the request body, so a tampered client can only pick which courier, never
 * the price.
 */
class CheckoutService
{
    public function __construct(
        private readonly OrderRepository $orders,
        private readonly PricingService $pricing,
        private readonly BiteshipService $biteship,
    ) {}

    /**
     * POST /checkout — FR-017.
     *
     * BR-026: regular checkout never applies Bulk Order tiered pricing —
     * that only happens through the dedicated checkoutBulk() flow below.
     * Every item keeps its own cart-time price snapshot (BR-025).
     */
    public function checkout(User $user, CheckoutDTO $dto): Order
    {
        $items = $this->fetchAndValidateCartItems($user, $dto->cartItemIds);
        $subtotal = $items->reduce(fn ($carry, CartItem $item) => bcadd($carry, $item->subtotal(), 2), '0');
        $totalQuantity = $items->sum('quantity');
        $shippingCost = $this->resolveShippingCost($dto->addressId, $totalQuantity, $dto->courierCompany, $dto->courierType);
        $total = bcadd($subtotal, (string) $shippingCost, 2);

        return DB::transaction(function () use ($user, $dto, $items, $subtotal, $shippingCost, $total) {
            $order = $this->orders->create([
                'user_id' => $user->id,
                'address_id' => $dto->addressId,
                'type' => 'reguler',
                'status' => 'belum_dibayar',
                'notes' => $dto->notes,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'courier_company' => $dto->courierCompany,
                'courier_type' => $dto->courierType,
                'total' => $total,
            ]);

            $this->orders->addItems($order, $items->map(fn (CartItem $item) => [
                'product_variant_id' => $item->product_variant_id,
                'design_id' => $item->design_id,
                'custom_design_file_path' => $item->custom_design_file_path,
                'design_position' => $item->design_position,
                'quantity' => $item->quantity,
                // BR-025: always the locked-in cart price — never a bulk tier.
                'unit_price' => $item->unit_price_snapshot,
                'subtotal' => $item->subtotal(),
            ])->all());

            $this->orders->recordStatusHistory($order, null, 'belum_dibayar', 'customer', $user->id);

            $items->each(fn (CartItem $item) => $item->delete());

            return $order->load('items.productVariant.product', 'items.design');
        });
    }

    /**
     * POST /checkout/bulk — FR-040/044, BR-012/026 (Flow 7). Bypasses the
     * cart entirely: a single product's variants + quantities are supplied
     * directly, priced by ONE tier looked up from the combined quantity
     * across all sizes (BR-012), never mixed with a regular order (BR-026).
     */
    public function checkoutBulk(User $user, BulkCheckoutDTO $dto): Order
    {
        $variantIds = collect($dto->items)->pluck('product_variant_id');
        $variants = ProductVariant::query()->with('product')->whereIn('id', $variantIds)->get()->keyBy('id');

        $inactive = $variants->first(fn (ProductVariant $variant) => ! $variant->product->is_active);
        if ($inactive) {
            throw ValidationException::withMessages([
                'items' => [__('messages.checkout.product_unavailable')],
            ]);
        }

        $totalQuantity = collect($dto->items)->sum('quantity');
        $bulkUnitPrice = $this->pricing->bulkUnitPriceFor($totalQuantity);

        if ($bulkUnitPrice === null) {
            throw ValidationException::withMessages([
                'items' => [__('messages.checkout.bulk_quantity_no_tier')],
            ]);
        }

        $subtotal = bcmul($bulkUnitPrice, (string) $totalQuantity, 2);
        $shippingCost = $this->resolveShippingCost($dto->addressId, $totalQuantity, $dto->courierCompany, $dto->courierType);
        $total = bcadd($subtotal, (string) $shippingCost, 2);

        return DB::transaction(function () use ($user, $dto, $subtotal, $bulkUnitPrice, $shippingCost, $total) {
            $order = $this->orders->create([
                'user_id' => $user->id,
                'address_id' => $dto->addressId,
                'type' => 'bulk',
                'status' => 'belum_dibayar',
                'notes' => $dto->notes,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'courier_company' => $dto->courierCompany,
                'courier_type' => $dto->courierType,
                'total' => $total,
            ]);

            $this->orders->addItems($order, collect($dto->items)->map(fn (array $item) => [
                'product_variant_id' => $item['product_variant_id'],
                'design_id' => $dto->designId,
                'custom_design_file_path' => $dto->customDesignFilePath,
                'quantity' => $item['quantity'],
                'unit_price' => $bulkUnitPrice,
                'subtotal' => bcmul($bulkUnitPrice, (string) $item['quantity'], 2),
            ])->all());

            $this->orders->recordStatusHistory($order, null, 'belum_dibayar', 'customer', $user->id);

            return $order->load('items.productVariant.product', 'items.design');
        });
    }

    /**
     * POST /checkout/shipping-rates — preview courier options before the
     * customer commits to one. Accepts either a cart selection or a raw
     * bulk-style item list (see ShippingRateRequest).
     *
     * @param  array<int>  $cartItemIds
     * @param  array<array{product_variant_id:int, quantity:int}>  $bulkItems
     * @return array<int, array{courier_company: string, courier_type: string, courier_service_name: string, price: int, duration: string}>
     */
    public function getShippingRates(User $user, int $addressId, array $cartItemIds = [], array $bulkItems = []): array
    {
        $address = Address::query()->findOrFail($addressId);

        $totalQuantity = $cartItemIds !== []
            ? $this->fetchAndValidateCartItems($user, $cartItemIds)->sum('quantity')
            : collect($bulkItems)->sum('quantity');

        $totalWeightGrams = $totalQuantity * (int) config('services.biteship.item_weight_grams');

        return $this->biteship->getRates($address->postal_code, $totalWeightGrams);
    }

    /**
     * Re-fetches the authoritative price for the customer's chosen courier
     * from Biteship — see class docblock for why this isn't trusted from
     * the request. Throws a validation error (rather than letting checkout
     * silently proceed with a wrong/zero shipping cost) if Biteship can't
     * confirm that courier is available for this destination right now.
     */
    private function resolveShippingCost(int $addressId, int $totalQuantity, string $courierCompany, string $courierType): int
    {
        // Same degrade-gracefully convention as BiteshipService::getRates().
        if (blank(config('services.biteship.api_key'))) {
            return 0;
        }

        $address = Address::query()->findOrFail($addressId);
        $totalWeightGrams = $totalQuantity * (int) config('services.biteship.item_weight_grams');

        $rate = $this->biteship->rateFor($address->postal_code, $totalWeightGrams, $courierCompany, $courierType);

        if ($rate === null) {
            throw ValidationException::withMessages([
                'courier_company' => [__('messages.checkout.shipping_rate_unavailable')],
            ]);
        }

        return $rate['price'];
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
                'cart_item_ids' => [__('messages.checkout.cart_item_unavailable')],
            ]);
        }

        return $items;
    }
}
