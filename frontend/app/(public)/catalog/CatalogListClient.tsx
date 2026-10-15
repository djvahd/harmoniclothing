"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpDown, PackageSearch, Search, X } from "lucide-react";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import InlineError from "@/components/ui/InlineError";
import ProductCard, { ProductCardSkeleton } from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import FilterSidebar, { EMPTY_FILTER_VALUE, type FilterSidebarValue } from "@/components/ui/FilterSidebar";
import type { ProductSort } from "@/services/catalog";
import { useProducts, useProductFilters } from "@/hooks/useProducts";
import type { Product } from "@/types/product";
import { filtersFromParams, syncFiltersToUrl, SORT_KEY, SEARCH_KEY } from "@/lib/filter-url";

const PER_PAGE = 40;

const SORT_OPTIONS: { value: ProductSort; key: string }[] = [
  { value: "terbaru", key: "newest" },
  { value: "harga_asc", key: "priceAsc" },
  { value: "harga_desc", key: "priceDesc" },
  { value: "terlaris", key: "bestSelling" },
  { value: "rating", key: "topRated" },
];

function KatalogPageContent() {
  const t = useTranslations("public.catalogList");
  const searchParams = useSearchParams();
  const kategoriParam = searchParams.get("kategori");

  // Filters, sort and search live in the URL too, so a refresh or a shared link shows the same list.
  const [search, setSearch] = useState(() => searchParams.get(SEARCH_KEY) ?? "");
  const [sort, setSort] = useState<ProductSort>(() => {
    const s = searchParams.get(SORT_KEY) as ProductSort | null;
    return s && ["terbaru", "harga_asc", "harga_desc", "terlaris", "rating"].includes(s) ? s : "terbaru";
  });
  const [filters, setFilters] = useState<FilterSidebarValue>(() => filtersFromParams(searchParams));
  const [showSort, setShowSort] = useState(false);
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<Product[]>([]);
  const sortRef = useRef<HTMLDivElement>(null);

  // A link that arrives with ?kategori=... (e.g. from the footer) while this page is open applies that category.
  useEffect(() => {
    const fromUrl = kategoriParam ?? "";
    setFilters((f) =>
      f.categories.join(",") === fromUrl ? f : { ...f, categories: fromUrl ? fromUrl.split(",") : [] },
    );
  }, [kategoriParam]);

  useEffect(() => {
    syncFiltersToUrl(filters, { [SORT_KEY]: sort === "terbaru" ? undefined : sort, [SEARCH_KEY]: search || undefined });
  }, [filters, sort, search]);

  // A new filter/sort combination starts over from page 1.
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

  const filterOptions = useProductFilters();

  // Unfiltered grand total for the "Menampilkan X dari Y produk" count — Y
  // is the whole catalog, not the filtered result set, so this is fetched
  // independently of `filters`/`sort`.
  const { data: totalData } = useProducts("total", { per_page: 1 });
  const grandTotal = totalData?.meta.total;

  const { data, error, isLoading } = useProducts("public", {
    page,
    per_page: PER_PAGE,
    sort,
    categories: filters.categories.length ? filters.categories : undefined,
    genders: filters.genders.length ? filters.genders : undefined,
    sizes: filters.sizes.length ? filters.sizes : undefined,
    colors: filters.colors.length ? filters.colors : undefined,
    materials: filters.materials.length ? filters.materials : undefined,
    price_min: filters.priceMin ? Number(filters.priceMin) : undefined,
    price_max: filters.priceMax ? Number(filters.priceMax) : undefined,
  });

  // Page 1 of a (possibly new) filter/sort combination replaces the
  // accumulated list; "Muat Lebih Banyak" appends subsequent pages onto it.
  useEffect(() => {
    if (!data) return;
    setAccumulated((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
  }, [data, page]);

  const filtered = useMemo(
    () =>
      search
        ? accumulated.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        : accumulated,
    [accumulated, search],
  );

  const hasMore = !!data && accumulated.length < data.meta.total;
  const isLoadingInitial = isLoading && accumulated.length === 0;
  const isLoadingMore = isLoading && page > 1;

  const hasActiveQuery =
    !!search ||
    filters.categories.length > 0 ||
    filters.genders.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.materials.length > 0 ||
    !!filters.priceMin ||
    !!filters.priceMax;

  return (
    <div className="flex flex-col">
      <section
        className="flex flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-20"
        style={{
          background:
            "linear-gradient(to bottom, transparent 85%, #f8fafc 100%), linear-gradient(28deg, #f8fafc 25%, #eef6f3 64%, #e0f1ea 96%)",
        }}
      >
        <div className="flex max-w-xl flex-col gap-4">
          <h1 className="font-heading text-h3 font-semibold text-text-primary md:text-h1">
            {t("title")}
          </h1>
          <p className="font-body text-sm text-text-secondary md:text-base">{t("subtitle")}</p>
          <div className="flex gap-3">
            <Button href="#catalog-body" variant="primary">{t("ctaCustomDesign")}</Button>
            <Button href="/marketplace" variant="secondary">{t("ctaViewDesigns")}</Button>
          </div>
        </div>
      </section>

      <section
        id="catalog-body"
        className="mx-auto flex w-full max-w-[1440px] scroll-mt-6 flex-col gap-6 px-4 py-8 md:flex-row md:px-20"
      >
        <FilterSidebar options={filterOptions} value={filters} onChange={setFilters} skeletonFacetCount={5} />

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
                  {SORT_OPTIONS.map((opt) => (
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

          <div id="product-grid" className="flex flex-wrap gap-6">
            {!isLoadingInitial && error && <InlineError />}
            {(isLoadingInitial || (!error && !hasActiveQuery && filtered.length === 0)) &&
              Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            {!isLoadingInitial && !error && hasActiveQuery && filtered.length === 0 && (
              <div className="flex w-full flex-col items-center gap-3 py-16 text-center">
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
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
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
    </div>
  );
}

export default function KatalogPage() {
  return <KatalogPageContent />;
}
