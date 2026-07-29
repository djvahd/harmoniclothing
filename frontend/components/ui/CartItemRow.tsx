import { X } from "lucide-react";
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

export default function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  const product = item.product_variant.product;
  const thumbnail = storageUrl(
    item.design?.thumbnail_path ?? item.product_variant.mockup_asset_path,
  );

  return (
    <div className="flex items-center gap-3">
      <ProductThumbnail src={thumbnail} alt={product?.name ?? "Produk"} />
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
        aria-label="Hapus dari keranjang"
        onClick={() => onRemove(item.id)}
        className="text-text-secondary hover:text-danger"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
