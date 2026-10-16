"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function RelatedGrid<T>({
  title,
  seeAllHref,
  isLoading,
  items,
  renderItem,
  renderSkeleton,
  skeletonCount = 6,
}: {
  title?: string;
  seeAllHref: string;
  isLoading: boolean;
  items: T[];
  renderItem: (item: T) => ReactNode;
  renderSkeleton: (index: number) => ReactNode;
  skeletonCount?: number;
}) {
  const t = useTranslations("product.relatedGrid");
  if (!isLoading && items.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
          {title ?? t("defaultTitle")}
        </h2>
        <Link
          href={seeAllHref}
          className="shrink-0 font-body text-sm font-medium text-primary transition-colors hover:text-accent hover:underline hover:underline-offset-4"
        >
          {t("viewAll")}
        </Link>
      </div>
      <div className="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, i) => renderSkeleton(i))
          : items.map((item) => renderItem(item))}
      </div>
    </div>
  );
}
