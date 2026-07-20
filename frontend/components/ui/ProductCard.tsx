import Link from "next/link";
import Image from "next/image";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/product";
import WishlistButton from "./WishlistButton";

export default function ProductCard({ product }: { product: Product }) {
  const thumbnail = storageUrl(product.variants?.[0]?.mockup_asset_path);

  return (
    <Link
      href={`/katalog/${product.slug}`}
      className="flex w-[220px] flex-col gap-1.5 rounded-md border border-border bg-surface p-4"
    >
      <div className="relative h-[174px] w-full shrink-0 overflow-hidden rounded-sm bg-border">
        {thumbnail && (
          <Image src={thumbnail} alt={product.name} fill sizes="220px" className="object-cover" />
        )}
        <WishlistButton productId={product.id} className="absolute right-2 top-2" />
      </div>
      <p className="font-heading text-lg font-medium text-text-primary">{product.name}</p>
      <p className="font-body text-sm text-text-secondary">
        Mulai dari {formatCurrency(product.base_price)}
      </p>
    </Link>
  );
}
