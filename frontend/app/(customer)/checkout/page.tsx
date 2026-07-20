"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ShieldCheck } from "lucide-react";
import OptionRow from "@/components/ui/OptionRow";
import PriceSummaryRow from "@/components/ui/PriceSummaryRow";
import Button from "@/components/ui/Button";
import { getCart } from "@/services/cart";
import { getAddresses } from "@/services/account";
import { checkout } from "@/services/checkout";
import { ApiError } from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cartData } = useSWR("/cart", getCart);
  const { data: addressData } = useSWR("/account/addresses", getAddresses);

  const items = cartData?.data ?? [];
  const addresses = addressData?.data ?? [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

  const [addressId, setAddressId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
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
    setError(null);
    setLoading(true);
    try {
      const { data: order } = await checkout({
        address_id: addressId,
        cart_item_ids: items.map((i) => i.id),
        notes: notes || undefined,
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
      <h1 className="font-heading text-2xl font-semibold text-text-primary">Checkout</h1>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          <section className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5">
            <p className="font-heading text-lg font-semibold text-text-primary">
              Alamat Pengiriman
            </p>
            {addresses.length === 0 && (
              <p className="font-body text-sm text-text-secondary">
                Belum ada alamat tersimpan. Tambahkan alamat di Address Book.
              </p>
            )}
            {addresses.map((address) => (
              <OptionRow
                key={address.id}
                selected={addressId === address.id}
                onSelect={() => setAddressId(address.id)}
                label={`${address.label} - ${address.recipient_name}`}
                sublabel={`${address.address_line}, ${address.district}, ${address.city}, ${address.province} ${address.postal_code}`}
              />
            ))}
          </section>

          <section className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5">
            <p className="font-heading text-lg font-semibold text-text-primary">
              Catatan (opsional)
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none"
              placeholder="Catatan untuk pesananmu..."
            />
          </section>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-md border border-border bg-surface p-5 md:w-[320px]">
          <p className="font-heading text-lg font-semibold text-text-primary">
            Ringkasan Pesanan
          </p>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between font-body text-sm">
              <span className="text-text-secondary">
                {item.product_variant.product?.name} x{item.quantity}
              </span>
              <span className="font-semibold text-text-primary">
                {new Intl.NumberFormat("id-ID").format(item.subtotal)}
              </span>
            </div>
          ))}
          <div className="border-t border-border pt-3">
            <PriceSummaryRow label="Subtotal" amount={subtotal} />
          </div>
          <PriceSummaryRow label="Total" amount={subtotal} emphasis />
          {error && <p className="font-body text-xs text-red-500">{error}</p>}
          <Button fullWidth loading={loading} onClick={handleSubmit}>
            Buat Pesanan
          </Button>
          <p className="flex items-center gap-1.5 font-body text-xs text-text-secondary">
            <ShieldCheck className="size-3.5 text-primary" />
            Pembayaran aman & terenkripsi
          </p>
        </div>
      </div>
    </div>
  );
}
