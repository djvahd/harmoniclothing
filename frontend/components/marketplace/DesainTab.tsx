"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpDown, PackageSearch, Search, X } from "lucide-react";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import DesignCard, { DesignCardSkeleton } from "@/components/ui/DesignCard";
import Button from "@/components/ui/Button";
import MobileCollapse from "@/components/ui/MobileCollapse";
import FilterSidebar, { EMPTY_FILTER_VALUE, type FilterSidebarValue } from "@/components/ui/FilterSidebar";
import InlineError from "@/components/ui/InlineError";
import { type DesignSort } from "@/services/marketplace";
import { useDesigns, useDesignFilters } from "@/hooks/useDesigns";
import type { Design } from "@/types/product";
import { filtersFromParams, syncFiltersToUrl, SORT_KEY, SEARCH_KEY } from "@/lib/filter-url";

const PER_PAGE = 40;

const DESIGN_SORT_OPTIONS: { value: DesignSort; key: string }[] = [
  { value: "terbaru", key: "newest" },
  { value: "harga_asc", key: "priceAsc" },
  { value: "harga_desc", key: "priceDesc" },
  { value: "terlaris", key: "bestSelling" },
  { value: "rating", key: "topRated" },
];

/** The "Desain" tab of the marketplace: filterable/sortable, infinite-load design grid. */
export default function DesainTab({
  kategoriParam,
  defaultSort,
}: {
  kategoriParam: string | null;
  defaultSort: DesignSort;
}) {
  const t = useTranslations("public.marketplaceList.designTab");
  const tFilter = useTranslations("ui.filterSidebar");
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get(SEARCH_KEY) ?? "");
  const [sort, setSort] = useState<DesignSort>(() => {
    const s = searchParams.get(SORT_KEY) as DesignSort | null;
    return s && ["terbaru", "harga_asc", "harga_desc", "terlaris", "rating"].includes(s) ? s : defaultSort;
  });
  const [filters, setFilters] = useState<FilterSidebarValue>(() => filtersFromParams(searchParams));
  const [showSort, setShowSort] = useState(false);
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<Design[]>([]);
  const sortRef = useRef<HTMLDivElement>(null);

  // A link that arrives with ?kategori=... while this tab is open applies that category.
  useEffect(() => {
    const fromUrl = kategoriParam ?? "";
    setFilters((f) =>
      f.categories.join(",") === fromUrl ? f : { ...f, categories: fromUrl ? fromUrl.split(",") : [] },
    );
  }, [kategoriParam]);

  // Mirror filters/sort/search into the URL (shareable, survives refresh).
  useEffect(() => {
    syncFiltersToUrl(filters, { [SORT_KEY]: sort === defaultSort ? undefined : sort, [SEARCH_KEY]: search || undefined });
  }, [filters, sort, search, defaultSort]);

  useEffect(() => {
    setPage(1);
  }, [filters, sort]);

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

  const filtersData = useDesignFilters();
  // FilterSidebar is shared with Katalog Produk — designs have no
  // gender/size/color/material dimensions of their own, so those facets are
  // always empty and those sections simply don't render.
  const filterOptions = filtersData
    ? { ...filtersData, genders: [], sizes: [], colors: [], materials: [] }
    : undefined;

  // Unfiltered grand total for the "Menampilkan X dari Y desain" count — Y
  // is every published design, not the filtered result set, so this is
  // fetched independently of `filters`/`sort`.
  const { data: totalData } = useDesigns("total", { per_page: 1 });
  const grandTotal = totalData?.meta.total;

  const { data, error, isLoading } = useDesigns("public", {
    page,
    per_page: PER_PAGE,
    sort,
    categories: filters.categories.length ? filters.categories : undefined,
    tags: filters.tags.length ? filters.tags : undefined,
    price_min: filters.priceMin ? Number(filters.priceMin) : undefined,
    price_max: filters.priceMax ? Number(filters.priceMax) : undefined,
  });

  useEffect(() => {
    if (!data) return;
    setAccumulated((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
  }, [data, page]);

  const filtered = useMemo(
    () =>
      search
        ? accumulated.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()))
        : accumulated,
    [accumulated, search],
  );

  const hasMore = !!data && accumulated.length < data.meta.total;
  const isLoadingInitial = isLoading && accumulated.length === 0;
  const isLoadingMore = isLoading && page > 1;

  const hasActiveQuery =
    !!search ||
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    !!filters.priceMin ||
    !!filters.priceMax;

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 md:flex-row md:px-20">
      <MobileCollapse label={tFilter("filter")}>
        <FilterSidebar
          options={filterOptions}
          value={filters}
          onChange={setFilters}
          skeletonFacetCount={2}
        />
      </MobileCollapse>

      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full max-w-[420px] shrink-0 items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2.5 transition-colors hover:border-primary hover:bg-border/40 focus-within:border-primary focus-within:bg-surface">
            <Search className="size-4 shrink-0 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                {DESIGN_SORT_OPTIONS.map((opt) => (
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
            {t("resultCount", { shown: filtered.length, total: grandTotal ?? filtered.length })}
          </p>
        )}

        <div className="grid grid-cols-2 justify-items-center gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {!isLoadingInitial && error && <div className="col-span-full"><InlineError /></div>}
          {(isLoadingInitial || (!error && !hasActiveQuery && filtered.length === 0)) &&
            Array.from({ length: 8 }).map((_, i) => <DesignCardSkeleton key={i} />)}
          {!isLoadingInitial && !error && hasActiveQuery && filtered.length === 0 && (
            <div className="col-span-full flex w-full flex-col items-center gap-3 py-16 text-center">
              <PackageSearch className="size-10 text-text-secondary" />
              <p className="font-body text-sm text-text-secondary">{t("noResults")}</p>
              <button
                onClick={() => {
                  setSearch("");
                  setFilters(EMPTY_FILTER_VALUE);
                }}
                className="font-body text-sm font-medium text-primary underline"
              >
                {t("resetFilters")}
              </button>
            </div>
          )}
          {filtered.map((design) => (
            <DesignCard key={design.id} design={design} />
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
