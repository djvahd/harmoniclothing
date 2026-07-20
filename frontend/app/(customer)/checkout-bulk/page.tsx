"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import OptionRow from "@/components/ui/OptionRow";
import PriceSummaryRow from "@/components/ui/PriceSummaryRow";
import Button from "@/components/ui/Button";
import { getCart } from "@/services/cart";
import { getAddresses } from "@/services/account";
import { getBulkPricingTiers } from "@/services/catalog";
import { checkoutBulk } from "@/services/checkout";
import { ApiError } from "@/lib/api";

export default function CheckoutBulkPage() {
  const router = useRouter();
  const { data: cartData } = useSWR("/cart", getCart);
  const { data: addressData } = useSWR("/account/addresses", getAddresses);
  const { data: tiersData } = useSWR("/bulk-pricing-tiers", getBulkPricingTiers);

  const items = cartData?.data ?? [];
  const addresses = addressData?.data ?? [];
  const tiers = tiersData?.data ?? [];
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

  // Mirrors PricingService::bulkUnitPriceFor() - the backend recomputes the
  // tier fresh from total quantity at checkout (BR-012), it does NOT use the
  // cart items' regular-price subtotal snapshots. Summing item.subtotal here
  // showed a wildly wrong total (regular price x qty) before the real bulk
  // price was even applied - caught via live browser testing 2026-07-20.
  const tier = tiers.find(
    (t) => totalQty >= t.min_qty && (t.max_qty === null || totalQty <= t.max_qty),
  );
  const unitPrice = Number(tier?.price_per_unit ?? 0);
  const subtotal = unitPrice * totalQty;

  const [addressId, setAddressId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (addressId === null && addresses.length > 0) {
      setAddressId(addresses.find((a) => a.is_default)?.id ?? addresses[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  async function handleSubmit() {
    if (!addressId) {
      setError("Pilih alamat pengiriman terlebih dahulu.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: order } = await checkoutBulk({
        address_id: addressId,
        cart_item_ids: items.map((i) => i.id),
      });
      if (order.midtrans_redirect_url) {
        window.location.href = order.midtrans_redirect_url;
      } else {
        router.push(`/akun/pesanan/${order.id}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <h1 className="font-heading text-2xl font-semibold text-text-primary">Checkout Bulk Order</h1>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-1 flex-col gap-3 rounded-md border border-border bg-surface p-5">
          <p className="font-heading text-lg font-semibold text-text-primary">
            Alamat Pengiriman
          </p>
          {addresses.map((address) => (
            <OptionRow
              key={address.id}
              selected={addressId === address.id}
              onSelect={() => setAddressId(address.id)}
              label={`${address.label} - ${address.recipient_name}`}
              sublabel={`${address.address_line}, ${address.city}`}
            />
          ))}
        </div>

        <div className="flex w-full flex-col gap-4 rounded-md border border-border bg-surface p-5 md:w-[320px]">
          <p className="font-heading text-lg font-semibold text-text-primary">
            Ringkasan Bulk Order
          </p>
          <PriceSummaryRow label={`Total Item (${totalQty} pcs)`} amount={subtotal} />
          <div className="border-t border-border pt-3">
            <PriceSummaryRow label="Total" amount={subtotal} emphasis />
          </div>
          <p className="font-body text-xs text-text-secondary">
            Harga tier grosir dihitung ulang berdasarkan total kuantitas saat checkout.
          </p>
          {error && <p className="font-body text-xs text-red-500">{error}</p>}
          <Button fullWidth loading={loading} onClick={handleSubmit}>
            Buat Pesanan Bulk
          </Button>
        </div>
      </div>
    </div>
  );
}
