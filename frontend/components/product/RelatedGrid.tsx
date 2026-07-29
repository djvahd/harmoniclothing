import type { ReactNode } from "react";
import Link from "next/link";

export default function RelatedGrid<T>({
  title = "Kamu Mungkin Suka",
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
  if (!isLoading && items.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">{title}</h2>
        <Link
          href={seeAllHref}
          className="shrink-0 font-body text-sm font-medium text-primary transition-colors hover:text-accent hover:underline hover:underline-offset-4"
        >
          Lihat Semua →
        </Link>
      </div>
      <div className="flex flex-wrap gap-6">
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, i) => renderSkeleton(i))
          : items.map((item) => renderItem(item))}
      </div>
    </div>
  );
}
