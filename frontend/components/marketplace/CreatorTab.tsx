"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { ArrowUpDown, LayoutGrid, Search, Tag as TagIcon, UserSearch, X } from "lucide-react";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import CreatorCard, { CreatorCardSkeleton } from "@/components/ui/CreatorCard";
import Button from "@/components/ui/Button";
import InlineError from "@/components/ui/InlineError";
import { CategoryList, Section } from "@/components/ui/FilterSidebar";
import { getCreators, type CreatorSort, type CreatorSummary } from "@/services/marketplace";
import { useDesignFilters } from "@/hooks/useDesigns";
import { swrKeys } from "@/lib/swr-keys";

const PER_PAGE = 40;

const CREATOR_SORT_OPTIONS: { value: CreatorSort; key: string }[] = [
  { value: "terbaru", key: "newest" },
  { value: "terlaris", key: "bestSelling" },
  { value: "rating", key: "topRated" },
];

/** The "Kreator" tab of the marketplace: filterable/sortable, infinite-load creator grid. */
export default function CreatorTab() {
  const t = useTranslations("public.marketplaceList.creatorTab");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [sort, setSort] = useState<CreatorSort>("terbaru");
  const [showSort, setShowSort] = useState(false);
  const [tagOpen, setTagOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<CreatorSummary[]>([]);
  const sortRef = useRef<HTMLDivElement>(null);

  // Reuses the Desain tab's category+tag facets (same taxonomy, same SWR
  // cache key) — no dedicated filters endpoint needed for the Creator tab.
  const filtersData = useDesignFilters();
  const categories = filtersData?.categories ?? [];
  const popularTags = filtersData?.popular_tags ?? [];

  // Unfiltered grand total for the "Menampilkan X dari Y kreator" count — Y
  // is every active creator, not the filtered result set, so this is
  // fetched independently of `sort`/`search`/`category`/`tags`.
  const { data: totalData } = useSWR(swrKeys.creators("total", { per_page: 1 }), () =>
    getCreators({ per_page: 1 }),
  );
  const grandTotal = totalData?.meta.total;

  useEffect(() => {
    setPage(1);
  }, [sort, search, category, tags]);

  useEffect(() => {
    if (!showSort) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSort(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSort]);

  const creatorParams = {
    page,
    per_page: PER_PAGE,
    sort,
    search: search || undefined,
    categories: category ? [category] : undefined,
    tags: tags.length ? tags : undefined,
  };
  const { data, error, isLoading } = useSWR(swrKeys.creators("public", creatorParams), () =>
    getCreators(creatorParams),
  );

  useEffect(() => {
    if (!data) return;
    setAccumulated((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
  }, [data, page]);

  const hasMore = !!data && accumulated.length < data.meta.total;
  const isLoadingInitial = isLoading && accumulated.length === 0;
  const isLoadingMore = isLoading && page > 1;
  const hasActiveQuery = !!search || !!category || tags.length > 0;

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 md:flex-row md:px-20">
      {!filtersData ? (
        <aside className="flex w-[220px] shrink-0 animate-pulse flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-16 rounded-sm bg-border" />
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 w-full rounded-md bg-border" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <div className="h-3.5 w-14 rounded-sm bg-border" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-7 w-16 rounded-full bg-border" />
              ))}
            </div>
          </div>
        </aside>
      ) : (
        (!!categories.length || !!popularTags.length) && (
        <aside className="flex w-[220px] shrink-0 flex-col gap-6">
          {!!categories.length && (
            <CategoryList
              label={t("categoryLabel")}
              icon={LayoutGrid}
              items={categories}
              selected={category ? [category] : []}
              onSelect={(slugs) => setCategory(slugs[0] ?? null)}
            />
          )}
          {!!popularTags.length && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-heading text-sm font-semibold text-text-primary">
                  {tags.length > 0 ? `${t("filterLabel")} (${tags.length})` : t("filterLabel")}
                </h2>
                {tags.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTags([])}
                    className="rounded-sm font-body text-sm text-text-secondary underline transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  >
                    {t("resetLabel")}
                  </button>
                )}
              </div>
              <div className="flex flex-col">
                <Section title={t("tagLabel")} isOpen={tagOpen} onToggle={() => setTagOpen((v) => !v)}>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((t) => (
                      <button
                        key={t.slug}
                        type="button"
                        onClick={() =>
                          setTags((prev) =>
                            prev.includes(t.slug) ? prev.filter((s) => s !== t.slug) : [...prev, t.slug],
                          )
                        }
                        className={clsx(
                          "flex items-center gap-1 rounded-full border px-3 py-1.5 text-center font-body text-sm transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                          tags.includes(t.slug)
                            ? "border-accent bg-accent text-text-primary"
                            : "border-border text-text-secondary hover:border-primary hover:bg-border/40 hover:text-text-primary",
                        )}
                      >
                        <TagIcon className="size-3" />
                        {t.name}
                      </button>
                    ))}
                  </div>
                </Section>
              </div>
            </div>
          )}
        </aside>
        )
      )}

      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full max-w-[420px] shrink-0 items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2.5 transition-colors hover:border-primary hover:bg-border/40 focus-within:border-primary focus-within:bg-surface">
            <Search className="size-4 shrink-0 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t("searchPlaceholder")}
              placeholder={t("searchPlaceholder")}
              className="w-full min-w-0 bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label={t("clearSearch")}
                className="shrink-0 rounded-full p-0.5 text-text-secondary transition-colors hover:bg-border/50 hover:text-text-primary"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div ref={sortRef} className="relative shrink-0">
            <button
              onClick={() => setShowSort((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 font-body text-sm text-text-secondary transition-colors hover:border-primary hover:bg-border/40 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <ArrowUpDown className="size-3.5" />
              {t("sortLabel")}
            </button>
            {showSort && (
              <div className="absolute right-0 top-full z-10 mt-2 w-56 rounded-md border border-border bg-surface p-1.5 shadow-md">
                {CREATOR_SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSort(opt.value);
                      setShowSort(false);
                    }}
                    className={clsx(
                      "block w-full rounded-sm px-3 py-2 text-left font-body text-sm transition-colors",
                      sort === opt.value
                        ? "bg-accent text-text-primary"
                        : "text-text-secondary hover:bg-border/50",
                    )}
                  >
                    {t(`sortOptions.${opt.key}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isLoadingInitial && !error && (
          <p className="font-body text-sm text-text-secondary">
            {t("resultCount", { shown: accumulated.length, total: grandTotal ?? accumulated.length })}
          </p>
        )}

        <div className="grid grid-cols-2 justify-items-center gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {!isLoadingInitial && error && <div className="col-span-full"><InlineError /></div>}
          {(isLoadingInitial || (!error && !data)) &&
            Array.from({ length: 8 }).map((_, i) => <CreatorCardSkeleton key={i} />)}
          {!isLoadingInitial && !error && !!data && data.data.length === 0 && accumulated.length === 0 && (
            <div className="col-span-full flex w-full flex-col items-center gap-3 py-16 text-center">
              <UserSearch className="size-10 text-text-secondary" />
              <p className="font-body text-sm text-text-secondary">{t("noResults")}</p>
              {hasActiveQuery && (
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory(null);
                    setTags([]);
                  }}
                  className="font-body text-sm font-medium text-primary underline"
                >
                  {t("resetFilters")}
                </button>
              )}
            </div>
          )}
          {accumulated.map((creator) => (
            <CreatorCard key={creator.slug} creator={creator} />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button variant="secondary" loading={isLoadingMore} onClick={() => setPage((p) => p + 1)}>
              {t("loadMore")}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
