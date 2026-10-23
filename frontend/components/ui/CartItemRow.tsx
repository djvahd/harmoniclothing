"use client";

import { Heart, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import ProductThumbnail from "./ProductThumbnail";
import QuantityStepper from "./QuantityStepper";
import { formatCurrency } from "@/lib/format";
import { storageUrl } from "@/lib/storage";
import type { CartItem } from "@/types/product";

interface CartItemRowProps {
  item: CartItem;
  selected: boolean;
  onToggleSelected: (id: number) => void;
  onQuantityChange: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  onMoveToWishlist: (id: number) => void;
}

/** One cart line item: checkbox, thumbnail, name/variant, price, and quantity/wishlist/remove controls. */
export default function CartItemRow({
  item,
  selected,
  onToggleSelected,
  onQuantityChange,
  onRemove,
  onMoveToWishlist,
}: CartItemRowProps) {
  const t = useTranslations("ui.cartItemRow");
  const tCommon = useTranslations("common");
  const product = item.product_variant.product;
  const thumbnail = storageUrl(
    item.design?.thumbnail_path ?? item.product_variant.mockup_asset_path,
  );

  return (
    <div className="flex flex-wrap items-start gap-3 sm:flex-nowrap">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggleSelected(item.id)}
        aria-label={t("selectAria")}
        className="mt-6 size-4 shrink-0"
      />
      <ProductThumbnail src={thumbnail} alt={product?.name ?? tCommon("productFallback")} />
      <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
        <p className="font-body text-sm font-semibold text-text-primary">{product?.name}</p>
        <p className="font-body text-xs text-text-secondary">
          {item.product_variant.size} · {item.product_variant.color}
        </p>
      </div>
      <div className="flex w-full shrink-0 items-center justify-between gap-2 pl-7 pt-1 sm:w-auto sm:flex-col sm:items-end sm:pl-0">
        <p className="font-body text-sm font-semibold text-text-primary">
          {formatCurrency(item.subtotal)}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            aria-label={t("moveToWishlistAria")}
            onClick={() => onMoveToWishlist(item.id)}
            className="text-text-secondary transition-colors hover:text-accent"
          >
            <Heart className="size-4" />
          </button>
          <button
            type="button"
            aria-label={t("removeAria")}
            onClick={() => onRemove(item.id)}
            className="text-text-secondary transition-colors hover:text-danger"
          >
            <Trash2 className="size-4" />
          </button>
          <QuantityStepper
            value={item.quantity}
            onChange={(quantity) => onQuantityChange(item.id, quantity)}
          />
        </div>
      </div>
    </div>
  );
}
