"use client";

import { useTranslations } from "next-intl";

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
}

/** Prev/next pager driven by a Laravel-style pagination `meta` object; renders nothing when there's only one page. */
export default function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("ui.pagination");
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.per_page));
  if (totalPages <= 1) return null;

  const canPrev = meta.current_page > 1;
  const canNext = meta.current_page < totalPages;

  return (
    <div className="flex items-center justify-between gap-4 font-body text-sm text-text-secondary">
      <p>{t("pageInfo", { current: meta.current_page, total: totalPages, grandTotal: meta.total })}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(meta.current_page - 1)}
          className="rounded-sm border border-border px-3 py-1.5 font-medium text-text-primary transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("previous")}
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(meta.current_page + 1)}
          className="rounded-sm border border-border px-3 py-1.5 font-medium text-text-primary transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
}
