"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import CartItemRow from "@/components/ui/CartItemRow";
import PriceSummaryRow from "@/components/ui/PriceSummaryRow";
import Button from "@/components/ui/Button";
import { getCart, removeCartItem, updateCartItem } from "@/services/cart";

export default function KeranjangPage() {
  const router = useRouter();
  const { data, isLoading } = useSWR("/cart", getCart);
  const items = data?.data ?? [];
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  async function handleQuantityChange(id: number, quantity: number) {
    await updateCartItem(id, quantity);
    mutate("/cart");
  }

  async function handleRemove(id: number) {
    await removeCartItem(id);
    mutate("/cart");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <h1 className="font-heading text-2xl font-semibold text-text-primary">Keranjang</h1>

      {isLoading && <p className="font-body text-sm text-text-secondary">Memuat keranjang...</p>}

      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-md border border-border bg-surface p-10 text-center">
          <p className="font-body text-sm text-text-secondary">Keranjangmu masih kosong.</p>
          <Link href="/katalog">
            <Button>Mulai Belanja</Button>
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex flex-1 flex-col gap-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-md border border-border bg-surface p-4">
                <CartItemRow
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
                {!item.is_available && (
                  <p className="mt-2 font-body text-xs text-red-500">
                    Produk ini sudah tidak tersedia.
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex w-full flex-col gap-4 rounded-md border border-border bg-surface p-5 md:w-[320px]">
            <p className="font-heading text-lg font-semibold text-text-primary">
              Ringkasan Pesanan
            </p>
            <PriceSummaryRow label="Subtotal" amount={subtotal} />
            <div className="border-t border-border pt-3">
              <PriceSummaryRow label="Total" amount={subtotal} emphasis />
            </div>
            <Button fullWidth onClick={() => router.push("/checkout")}>
              Lanjut ke Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
