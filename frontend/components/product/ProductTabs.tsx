"use client";

import clsx from "clsx";
import { Star, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import Pagination, { type PaginationMeta } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/format";
import type { Review } from "@/types/product";

export interface TabDef {
  key: string;
  label: string;
  badge?: number;
}

export default function ProductTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly TabDef[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-border">
      {tabs.map((tabDef) => (
        <button
          key={tabDef.key}
          type="button"
          onClick={() => onChange(tabDef.key)}
          className={clsx(
            "relative px-4 py-3 font-heading text-sm font-semibold transition-colors",
            active === tabDef.key ? "text-primary" : "text-text-secondary hover:text-text-primary",
          )}
        >
          {tabDef.badge ? `${tabDef.label} (${tabDef.badge})` : tabDef.label}
          {active === tabDef.key && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}

export function CareTabContent() {
  const t = useTranslations("product.tabs");
  return <p>{t("careContent")}</p>;
}

export function ShippingTabContent() {
  const t = useTranslations("product.tabs");
  return <p>{t("shippingContent")}</p>;
}

export function ReviewsTabContent({
  hasRating,
  ratingAverage,
  reviewCount,
  emptyMessage,
  reviews,
  reviewsLoading,
  meta,
  distribution,
  onPageChange,
}: {
  hasRating: boolean;
  ratingAverage: number | null | undefined;
  reviewCount: number | null | undefined;
  emptyMessage: string;
  reviews: Review[];
  reviewsLoading: boolean;
  meta?: PaginationMeta;
  /** Review count per star ("5".."1"); omitted for items whose endpoint does not report it. */
  distribution?: Record<string, number>;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("product.tabs");
  if (!hasRating) return <p>{emptyMessage}</p>;

  const total = distribution ? Object.values(distribution).reduce((sum, n) => sum + n, 0) : 0;
  const satisfied = (distribution?.["5"] ?? 0) + (distribution?.["4"] ?? 0);
  return (
    <div className="flex flex-col gap-4">
      <p>{t("ratingSummary", { rating: ratingAverage ?? 0, count: reviewCount ?? 0 })}</p>
      {distribution && total > 0 && (
        <div className="flex flex-col gap-2 rounded-md border border-border p-4">
          <p className="font-medium text-text-primary">{t("satisfiedBuyers", { percent: Math.round((satisfied / total) * 100) })}</p>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[String(star)] ?? 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="flex w-8 shrink-0 items-center gap-0.5 text-text-secondary">
                  <Star className="size-3 fill-warning text-warning" />
                  {star}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-warning" style={{ width: `${(count / total) * 100}%` }} />
                </div>
                <span className="w-12 shrink-0 text-right text-text-secondary">
                  {Math.round((count / total) * 100)}% ({count})
                </span>
              </div>
            );
          })}
        </div>
      )}
      {reviewsLoading && <p className="text-xs text-text-secondary">{t("loadingReviews")}</p>}
      <div className="flex flex-col divide-y divide-border">
        {reviews.map((review) => (
          <div key={review.id} className="flex flex-col gap-1.5 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-border text-text-secondary">
                  <UserRound className="size-3.5" />
                </span>
                <span className="font-medium text-text-primary">{review.user?.name ?? t("buyerFallback")}</span>
              </div>
              <span className="text-xs text-text-secondary">{formatDate(review.created_at)}</span>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={clsx("size-3.5", i < review.rating ? "fill-warning text-warning" : "text-border")}
                />
              ))}
            </div>
            {review.comment && <p>{review.comment}</p>}
          </div>
        ))}
      </div>
      {meta && <Pagination meta={meta} onPageChange={onPageChange} />}
    </div>
  );
}
