"use client";

import Link from "next/link";
import { Star, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CreatorSummary } from "@/services/marketplace";

export function CreatorCardSkeleton() {
  return (
    <div className="flex w-[196px] animate-pulse flex-col items-center gap-2 rounded-md border border-border bg-surface p-4">
      <div className="size-16 shrink-0 rounded-full bg-border" />
      <div className="h-3.5 w-4/5 rounded-sm bg-border" />
      <div className="h-2.5 w-full rounded-sm bg-border" />
      <div className="h-2.5 w-1/2 rounded-sm bg-border" />
    </div>
  );
}

/** Marketplace creator grid card: avatar, name/bio, design count, rating/sold count, links to the public profile. */
export default function CreatorCard({ creator }: { creator: CreatorSummary }) {
  const t = useTranslations("ui.card");
  const hasRating = creator.review_count > 0 && creator.rating_average != null;
  const hasSold = creator.sold_count > 0;

  return (
    <Link
      href={`/marketplace/${creator.slug}`}
      className="group flex w-[196px] flex-col items-center gap-2 rounded-md border border-border bg-surface p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-border text-text-secondary">
        <UserRound className="size-7" />
      </span>

      <div className="flex min-h-[42px] flex-col gap-0.5">
        <p className="line-clamp-1 font-heading text-body-sm font-medium text-text-primary">{creator.name}</p>
        {creator.bio && (
          <p className="line-clamp-2 font-body text-[11px] text-text-secondary">{creator.bio}</p>
        )}
      </div>

      <p className="font-body text-[12px] text-text-primary">{t("designCount", { count: creator.design_count })}</p>

      <div className="flex items-center gap-1 font-body text-[11px] text-text-secondary">
        {hasRating || hasSold ? (
          <>
            {hasRating && (
              <span className="flex items-center gap-0.5">
                <Star className="size-3 fill-warning text-warning" />
                {creator.rating_average}
              </span>
            )}
            {hasRating && hasSold && <span>·</span>}
            {hasSold && <span>{t("sold", { count: creator.sold_count ?? 0 })}</span>}
          </>
        ) : (
          <>&nbsp;</>
        )}
      </div>
    </Link>
  );
}
