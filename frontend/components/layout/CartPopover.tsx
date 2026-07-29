"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductThumbnail from "@/components/ui/ProductThumbnail";
import { useCart } from "@/hooks/useCart";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";

/** Header cart icon + hover dropdown preview (first 3 items, subtotal, checkout CTA). */
export default function CartPopover({
  open,
  onOpen,
  onScheduleClose,
  onCancelClose,
  onNavigate,
}: {
  open: boolean;
  onOpen: () => void;
  onScheduleClose: () => void;
  onCancelClose: () => void;
  onNavigate: () => void;
}) {
  const { items, isLoading } = useCart();
  const preview = items.slice(0, 3);
  const total = items.length;
  const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onScheduleClose}>
      <button type="button" aria-label="Keranjang" className="relative text-text-primary">
        <ShoppingCart className="size-5" />
        {total > 0 && (
          <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-danger-fg">
            {total}
          </span>
        )}
      </button>
      {open && (
        <div
          onMouseEnter={onCancelClose}
          className="absolute right-0 top-full z-40 mt-2 w-[340px] rounded-md border border-border bg-surface shadow-lg"
        >
          <div className="flex items-center justify-between px-5 py-3">
            <p className="font-body text-sm font-semibold text-text-primary">
              Keranjang {!isLoading && `(${total})`}
            </p>
            <Link href="/cart" onClick={onNavigate} className="font-body text-sm font-medium text-primary">
              Lihat Semua
            </Link>
          </div>
          <div className="border-t border-border" />
          {isLoading ? (
            <div className="flex animate-pulse flex-col gap-3.5 px-5 py-3.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-10 shrink-0 rounded-sm bg-border" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="h-3 w-3/5 rounded-sm bg-border" />
                    <div className="h-3 w-2/5 rounded-sm bg-border" />
                  </div>
                  <div className="h-3 w-12 rounded-sm bg-border" />
                </div>
              ))}
            </div>
          ) : preview.length === 0 ? (
            <p className="px-5 py-6 text-center font-body text-sm text-text-secondary">
              Keranjangmu masih kosong.
            </p>
          ) : (
            <div className="flex flex-col gap-3.5 px-5 py-3.5">
              {preview.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <ProductThumbnail
                    src={storageUrl(
                      item.design?.thumbnail_path ?? item.product_variant.mockup_asset_path,
                    )}
                    alt={item.product_variant.product?.name ?? "Produk"}
                    size={40}
                  />
                  <div className="flex flex-1 flex-col gap-0.5">
                    <p className="font-body text-sm font-medium text-text-primary">
                      {item.product_variant.product?.name ?? "Produk"}
                    </p>
                    <p className="font-body text-xs text-text-secondary">
                      {item.product_variant.size} · {item.product_variant.color}
                    </p>
                  </div>
                  <p className="font-body text-sm font-semibold text-text-primary">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          )}
          {preview.length > 0 && (
            <>
              <div className="border-t border-border" />
              <div className="flex flex-col gap-3 px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <p className="font-body text-sm text-text-secondary">Subtotal</p>
                  <p className="font-body text-sm font-semibold text-text-primary">
                    {formatCurrency(subtotal)}
                  </p>
                </div>
                <Link href="/checkout" onClick={onNavigate}>
                  <Button fullWidth>Lanjut ke Checkout</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
