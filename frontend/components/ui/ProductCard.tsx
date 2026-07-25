import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/product";
import WishlistButton from "./WishlistButton";

export function ProductCardSkeleton() {
  return (
    <div className="flex w-[196px] animate-pulse flex-col gap-[5px] rounded-md border border-border bg-surface p-[14px]">
      <div className="h-[155px] w-full shrink-0 rounded-sm bg-border" />
      <div className="flex min-h-[42px] flex-col justify-start gap-1.5">
        <div className="h-3 w-4/5 rounded-sm bg-border" />
        <div className="h-3 w-3/5 rounded-sm bg-border" />
      </div>
      <div className="h-4 w-2/3 rounded-sm bg-border" />
      <div className="h-3 w-1/2 rounded-sm bg-border" />
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const thumbnail = storageUrl(product.variants?.[0]?.mockup_asset_path);

  const hasRating = !!product.review_count && product.review_count > 0 && product.rating_average != null;
  const hasSold = !!product.sold_count && product.sold_count > 0;

  return (
    <Link
      href={`/katalog-produk/${product.slug}`}
      className="group flex w-[196px] flex-col gap-[5px] rounded-md border border-border bg-surface p-[14px] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="relative h-[155px] w-full shrink-0 overflow-hidden rounded-sm bg-border">
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={product.name}
            fill
            sizes="196px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <WishlistButton productId={product.id} className="absolute right-2 top-2" />
      </div>

      <div className="flex min-h-[42px] flex-col justify-start">
        <p className="line-clamp-2 font-heading text-body-sm font-medium text-text-primary transition-colors group-hover:text-primary">
          {product.name}
        </p>
      </div>

      <p className="font-body text-[12px] font-semibold text-text-primary">
        Mulai dari {formatCurrency(product.base_price)}
      </p>

      <div className="flex items-center gap-1 font-body text-[11px] text-text-secondary">
        {hasRating || hasSold ? (
          <>
            {hasRating && (
              <span className="flex items-center gap-0.5">
                <Star className="size-3 fill-yellow-400 text-yellow-400" />
                {product.rating_average}
              </span>
            )}
            {hasRating && hasSold && <span>·</span>}
            {hasSold && <span>{product.sold_count} terjual</span>}
          </>
        ) : (
          <>&nbsp;</>
        )}
      </div>
    </Link>
  );
}
