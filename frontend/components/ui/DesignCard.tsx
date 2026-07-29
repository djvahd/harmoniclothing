import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import type { Design } from "@/types/product";
import WishlistButton from "./WishlistButton";

export function DesignCardSkeleton() {
  return (
    <div className="flex w-[196px] animate-pulse flex-col gap-[5px] rounded-md border border-border bg-surface p-[14px]">
      <div className="h-[155px] w-full shrink-0 rounded-sm bg-border" />
      <div className="flex min-h-[58px] flex-col justify-start gap-1.5">
        <div className="h-3 w-4/5 rounded-sm bg-border" />
        <div className="h-3 w-3/5 rounded-sm bg-border" />
        <div className="h-2.5 w-2/5 rounded-sm bg-border" />
      </div>
      <div className="h-4 w-2/3 rounded-sm bg-border" />
      <div className="h-3 w-1/2 rounded-sm bg-border" />
    </div>
  );
}

interface DesignCardProps {
  design: Design;
  startingPrice?: number;
}

export default function DesignCard({ design, startingPrice }: DesignCardProps) {
  const thumbnail = storageUrl(design.thumbnail_path);
  const price =
    startingPrice ??
    design.starting_price ??
    (design.products?.length
      ? Math.min(...design.products.map((p) => p.base_price))
      : undefined);

  const hasRating = !!design.review_count && design.review_count > 0 && design.rating_average != null;
  const hasSold = !!design.sold_count && design.sold_count > 0;

  return (
    <Link
      href={`/marketplace/design/${design.slug}`}
      className="group flex w-[196px] flex-col gap-[5px] rounded-md border border-border bg-surface p-[14px] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="relative h-[155px] w-full shrink-0 overflow-hidden rounded-sm bg-border">
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={design.title}
            fill
            sizes="196px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <WishlistButton designId={design.id} className="absolute right-2 top-2" />
      </div>

      {/* Title and creator sit in one reserved-height block, close together —
          the rating/sold row further below is a separate element. */}
      <div className="flex min-h-[58px] flex-col justify-start gap-0.5">
        <p className="line-clamp-2 font-heading text-body-sm font-medium text-text-primary">
          {design.title}
        </p>
        <p className="line-clamp-1 font-body text-[11px] text-text-secondary">by {design.creator.name}</p>
      </div>

      <p className="font-body text-[12px] font-semibold text-text-primary">
        {price !== undefined ? `Mulai dari ${formatCurrency(price)}` : " "}
      </p>

      <div className="flex items-center gap-1 font-body text-[11px] text-text-secondary">
        {hasRating || hasSold ? (
          <>
            {hasRating && (
              <span className="flex items-center gap-0.5">
                <Star className="size-3 fill-warning text-warning" />
                {design.rating_average}
              </span>
            )}
            {hasRating && hasSold && <span>·</span>}
            {hasSold && <span>{design.sold_count} terjual</span>}
          </>
        ) : (
          <>&nbsp;</>
        )}
      </div>
    </Link>
  );
}
