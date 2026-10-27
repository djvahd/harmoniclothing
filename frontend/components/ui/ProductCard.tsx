"use client";

import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { storageUrl } from "@/lib/storage";
import { formatCurrency, formatSoldCount } from "@/lib/format";
import type { Product } from "@/types/product";
import WishlistButton from "./WishlistButton";

/** Below this many reviews the average is mostly noise (one 1-star review reads as "1.0"), so only the count is shown. */
const MIN_REVIEWS_FOR_RATING = 5;

export function ProductCardSkeleton() {
  return (
    <div className="flex w-full max-w-[196px] animate-pulse flex-col gap-[5px] rounded-md border border-border bg-surface p-[14px]">
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

/** Catalog grid card: thumbnail, name, starting price, rating/sold count, wishlist toggle, links to the product detail page. */
export default function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("ui.card");
  const thumbnail = storageUrl(product.variants?.[0]?.mockup_asset_path);

  const reviewCount = product.review_count ?? 0;
  const hasRating = reviewCount >= MIN_REVIEWS_FOR_RATING && product.rating_average != null;
  const hasFewReviews = reviewCount > 0 && !hasRating;
  const hasSold = !!product.sold_count && product.sold_count > 0;

  return (
    <div className="relative w-full max-w-[196px] transition-transform duration-200 hover:-translate-y-0.5">
    <Link
      href={`/produk/${product.slug}`}
      className="group flex w-full flex-col gap-[5px] rounded-md border border-border bg-surface p-[14px] transition-all duration-200 hover:border-primary/30 hover:shadow-md"
    >
      <div className="relative h-[155px] w-full shrink-0 overflow-hidden rounded-sm bg-border">
        {thumbnail && (
          <SafeImage
            src={thumbnail}
            alt={product.name}
            fill
            sizes="196px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>

      <div className="flex min-h-[42px] flex-col justify-start">
        <p className="line-clamp-2 font-heading text-body-sm font-medium text-text-primary">
          {product.name}
        </p>
      </div>

      <p className="font-body text-[12px] font-semibold text-text-primary">
        {t("startingFrom", { price: formatCurrency(product.base_price) })}
      </p>

      <div className="flex items-center gap-1 font-body text-[11px] text-text-secondary">
        {hasRating || hasFewReviews || hasSold ? (
          <>
            {hasRating && (
              <span className="flex items-center gap-0.5">
                <Star className="size-3 fill-warning text-warning" />
                {product.rating_average}
              </span>
            )}
            {hasFewReviews && <span>{t("reviewCountOnly", { count: reviewCount })}</span>}
            {(hasRating || hasFewReviews) && hasSold && <span>·</span>}
            {hasSold && <span>{t("sold", { count: formatSoldCount(product.sold_count ?? 0) })}</span>}
          </>
        ) : (
          <>&nbsp;</>
        )}
      </div>
    </Link>
    <WishlistButton productId={product.id} className="absolute right-[22px] top-[22px] z-10" />
    </div>
  );
}
