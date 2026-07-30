"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import ProductThumbnail from "./ProductThumbnail";
import QuantityStepper from "./QuantityStepper";
import { formatCurrency } from "@/lib/format";
import { storageUrl } from "@/lib/storage";
import type { CartItem } from "@/types/product";

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

/** One cart line item: thumbnail, name/variant, quantity stepper, subtotal, and a remove button. */
export default function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  const t = useTranslations("ui.cartItemRow");
  const tCommon = useTranslations("common");
  const product = item.product_variant.product;
  const thumbnail = storageUrl(
    item.design?.thumbnail_path ?? item.product_variant.mockup_asset_path,
  );

  return (
    <div className="flex items-center gap-3">
      <ProductThumbnail src={thumbnail} alt={product?.name ?? tCommon("productFallback")} />
      <div className="flex flex-col gap-1">
        <p className="font-body text-sm font-semibold text-text-primary">{product?.name}</p>
        <p className="font-body text-xs text-text-secondary">
          {item.product_variant.size} · {item.product_variant.color}
        </p>
      </div>
      <QuantityStepper
        value={item.quantity}
        onChange={(quantity) => onQuantityChange(item.id, quantity)}
      />
      <p className="font-body text-sm font-semibold text-text-primary">
        {formatCurrency(item.subtotal)}
      </p>
      <button
        type="button"
        aria-label={t("removeAria")}
        onClick={() => onRemove(item.id)}
        className="text-text-secondary hover:text-danger"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
