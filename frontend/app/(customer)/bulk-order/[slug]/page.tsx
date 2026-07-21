"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { getProductBySlug, getBulkPricingTiers } from "@/services/catalog";
import { addToCart } from "@/services/cart";
import { formatCurrency } from "@/lib/format";
import Button from "@/components/ui/Button";

export default function BulkOrderPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: productData } = useSWR(`/catalog/products/${params.slug}`, () =>
    getProductBySlug(params.slug),
  );
  const { data: tiersData } = useSWR("/bulk-pricing-tiers", getBulkPricingTiers);
  const product = productData?.data;
  const tiers = tiersData?.data ?? [];

  const colors = useMemo(
    () => Array.from(new Set(product?.variants?.map((v) => v.color) ?? [])),
    [product],
  );
  const [color, setColor] = useState<string | null>(null);
  const activeColor = color ?? colors[0];
  const sizes = useMemo(
    () => product?.variants?.filter((v) => v.color === activeColor) ?? [],
    [product, activeColor],
  );

  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const totalQty = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const tier = tiers.find(
    (t) => totalQty >= t.min_qty && (t.max_qty === null || totalQty <= t.max_qty),
  );
  const pricePerUnit = tier?.price_per_unit ?? product?.base_price ?? 0;
  const total = pricePerUnit * totalQty;

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const entries = Object.entries(quantities).filter(([, qty]) => qty > 0);
      for (const [variantId, qty] of entries) {
        await addToCart({ product_variant_id: Number(variantId), quantity: qty });
      }
      await mutate("/cart");
      router.push("/checkout-bulk");
    } finally {
      setSubmitting(false);
    }
  }

  if (!product) return <p className="p-8 font-body text-sm text-text-secondary">Memuat produk...</p>;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 md:px-20">
      <h1 className="font-heading text-h3 font-semibold text-text-primary">
        Bulk Order - {product.name}
      </h1>

      <div className="flex gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-label={c}
            className={
              activeColor === c
                ? "size-8 rounded-full border-2 border-accent"
                : "size-8 rounded-full border border-border"
            }
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {tiers.length > 0 && (
        <div className="rounded-md border border-accent bg-accent/5 p-4">
          <p className="font-body text-sm font-semibold text-text-primary">Tier Harga Grosir</p>
          <div className="mt-2 flex flex-wrap gap-4">
            {tiers.map((t) => (
              <p key={t.min_qty} className="font-body text-xs text-text-secondary">
                {t.min_qty}
                {t.max_qty ? `-${t.max_qty}` : "+"} pcs: {formatCurrency(t.price_per_unit)}/pcs
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-5">
        <div className="grid grid-cols-2 gap-3 font-body text-sm font-semibold text-text-primary">
          <span>Ukuran</span>
          <span>Jumlah</span>
        </div>
        {sizes.map((variant) => (
          <div key={variant.id} className="grid grid-cols-2 items-center gap-3">
            <span className="font-body text-sm text-text-primary">{variant.size}</span>
            <input
              type="number"
              min={0}
              value={quantities[variant.id] ?? 0}
              onChange={(e) =>
                setQuantities((q) => ({ ...q, [variant.id]: Number(e.target.value) }))
              }
              className="w-24 rounded-sm border border-border bg-surface px-3 py-2 font-body text-sm outline-none"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-5">
        <div className="flex justify-between font-body text-sm">
          <span className="text-text-secondary">Total Jumlah</span>
          <span className="font-semibold text-text-primary">{totalQty} pcs</span>
        </div>
        <div className="flex justify-between font-body text-lg">
          <span className="font-semibold text-text-primary">Total Harga</span>
          <span className="font-semibold text-primary">{formatCurrency(total)}</span>
        </div>
      </div>

      <Button loading={submitting} disabled={totalQty === 0} onClick={handleSubmit}>
        Lanjut ke Checkout Bulk
      </Button>
    </div>
  );
}
