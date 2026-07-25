"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { ArrowUpDown, LayoutGrid, PackageSearch, Search, Tag as TagIcon, UserSearch, X } from "lucide-react";
import clsx from "clsx";
import DesignCard, { DesignCardSkeleton } from "@/components/ui/DesignCard";
import CreatorCard, { CreatorCardSkeleton } from "@/components/ui/CreatorCard";
import Button from "@/components/ui/Button";
import FilterSidebar, {
  CategoryList,
  EMPTY_FILTER_VALUE,
  type FilterSidebarValue,
} from "@/components/ui/FilterSidebar";
import {
  getDesigns,
  getDesignFilters,
  getCreators,
  type DesignSort,
  type CreatorSort,
  type CreatorSummary,
} from "@/services/marketplace";
import type { Design } from "@/types/product";

const PER_PAGE = 40;

const DESIGN_SORT_OPTIONS: { value: DesignSort; label: string }[] = [
  { value: "terbaru", label: "Terbaru" },
  { value: "harga_asc", label: "Harga: Rendah ke Tinggi" },
  { value: "harga_desc", label: "Harga: Tinggi ke Rendah" },
  { value: "terlaris", label: "Terlaris" },
  { value: "rating", label: "Rating Tertinggi" },
];

const CREATOR_SORT_OPTIONS: { value: CreatorSort; label: string }[] = [
  { value: "terbaru", label: "Terbaru" },
  { value: "terlaris", label: "Terlaris" },
  { value: "rating", label: "Rating Tertinggi" },
];

type Tab = "desain" | "creator";

export default function MarketplaceDesainPage() {
  const searchParams = useSearchParams();
  const kategoriParam = searchParams.get("kategori");
  // Beranda's "Desain Populer" row links here with ?sort=populer — map that
  // intent onto the closest real sort option (most sold) rather than
  // leaving it silently unread.
  const populerSort = searchParams.get("sort") === "populer";
  const initialTab: Tab = searchParams.get("tab") === "creator" ? "creator" : "desain";

  const [tab, setTab] = useState<Tab>(initialTab);

  const tabs: { key: Tab; label: string }[] = [
    { key: "desain", label: "Desain" },
    { key: "creator", label: "Kreator" },
  ];

  return (
    <div className="flex flex-col">
      <section
        className="flex flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-20"
        style={{ background: "linear-gradient(28deg, #f8fafc 25%, #eef6f3 64%, #e0f1ea 96%)" }}
      >
        <div className="flex max-w-xl flex-col gap-4">
          <h1 className="font-heading text-h3 font-semibold text-text-primary md:text-h1">
            Marketplace Desain
          </h1>
          <p className="font-body text-sm text-text-secondary md:text-base">
            Jelajahi ratusan desain siap pakai dari kreator lokal Indonesia, atau temukan kreator
            favoritmu.
          </p>
          <div className="flex gap-3">
            <Link href="/katalog-produk">
              <Button variant="secondary">Lihat Produk</Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1440px] gap-2 border-b border-border px-4 md:px-20">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              "relative px-4 py-3 font-heading text-sm font-semibold transition-colors",
              tab === t.key ? "text-primary" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {t.label}
            {tab === t.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {tab === "desain" ? (
        <DesainTab kategoriParam={kategoriParam} defaultSort={populerSort ? "terlaris" : "terbaru"} />
      ) : (
        <CreatorTab />
      )}
    </div>
  );
}

function DesainTab({
  kategoriParam,
  defaultSort,
}: {
  kategoriParam: string | null;
  defaultSort: DesignSort;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<DesignSort>(defaultSort);
  const [filters, setFilters] = useState<FilterSidebarValue>(() =>
    kategoriParam ? { ...EMPTY_FILTER_VALUE, categories: [kategoriParam] } : EMPTY_FILTER_VALUE,
  );
  const [showSort, setShowSort] = useState(false);
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<Design[]>([]);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (kategoriParam) {
      setFilters((f) =>
        f.categories.includes(kategoriParam) ? f : { ...f, categories: [kategoriParam] },
      );
    }
  }, [kategoriParam]);

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

  const { data: filtersData } = useSWR("/marketplace/designs/filters", getDesignFilters);
  // FilterSidebar is shared with Katalog Produk — designs have no
  // gender/size/color/material dimensions of their own, so those facets are
  // always empty and those sections simply don't render.
  const filterOptions = filtersData?.data
    ? { ...filtersData.data, genders: [], sizes: [], colors: [], materials: [] }
    : undefined;

  const { data: totalData } = useSWR("/marketplace/designs/total", () => getDesigns({ per_page: 1 }));
  const grandTotal = totalData?.meta.total;

  const { data, error, isLoading } = useSWR(["/marketplace/designs", sort, filters, page], () =>
    getDesigns({
      page,
      per_page: PER_PAGE,
      sort,
      categories: filters.categories.length ? filters.categories : undefined,
      tags: filters.tags.length ? filters.tags : undefined,
      price_min: filters.priceMin ? Number(filters.priceMin) : undefined,
      price_max: filters.priceMax ? Number(filters.priceMax) : undefined,
    }),
  );

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
      <FilterSidebar
        options={filterOptions}
        value={filters}
        onChange={setFilters}
      />

      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full max-w-[420px] shrink-0 items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2.5 transition-colors hover:border-primary hover:bg-border/40 focus-within:border-primary focus-within:bg-surface">
            <Search className="size-4 shrink-0 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari desain atau tag..."
              className="w-full min-w-0 bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
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
              Urutkan
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
                        ? "bg-accent text-text-on-accent"
                        : "text-text-secondary hover:bg-border/50",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isLoadingInitial && !error && (
          <p className="font-body text-sm text-text-secondary">
            Menampilkan {filtered.length} dari {grandTotal ?? filtered.length} desain
          </p>
        )}

        <div className="flex flex-wrap gap-6">
          {(isLoadingInitial || error || (!hasActiveQuery && filtered.length === 0)) &&
            Array.from({ length: 8 }).map((_, i) => <DesignCardSkeleton key={i} />)}
          {!isLoadingInitial && !error && hasActiveQuery && filtered.length === 0 && (
            <div className="flex w-full flex-col items-center gap-3 py-16 text-center">
              <PackageSearch className="size-10 text-text-secondary" />
              <p className="font-body text-sm text-text-secondary">
                Belum ada desain ditemukan untuk filter ini.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setFilters(EMPTY_FILTER_VALUE);
                }}
                className="font-body text-sm font-medium text-primary underline"
              >
                Reset pencarian & filter
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
              Muat Lebih Banyak
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function CreatorTab() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [sort, setSort] = useState<CreatorSort>("terbaru");
  const [showSort, setShowSort] = useState(false);
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<CreatorSummary[]>([]);
  const sortRef = useRef<HTMLDivElement>(null);

  // Reuses the Desain tab's category+tag facets (same taxonomy, same SWR
  // cache key) — no dedicated filters endpoint needed for the Creator tab.
  const { data: filtersData } = useSWR("/marketplace/designs/filters", getDesignFilters);
  const categories = filtersData?.data.categories ?? [];
  const popularTags = filtersData?.data.popular_tags ?? [];

  // Unfiltered grand total for the "Menampilkan X dari Y kreator" count — Y
  // is every active creator, not the filtered result set, so this is
  // fetched independently of `sort`/`search`/`category`/`tags`.
  const { data: totalData } = useSWR("/marketplace/creators/total", () => getCreators({ per_page: 1 }));
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

  const { data, error, isLoading } = useSWR(["/marketplace/creators", sort, search, category, tags, page], () =>
    getCreators({
      page,
      per_page: PER_PAGE,
      sort,
      search: search || undefined,
      categories: category ? [category] : undefined,
      tags: tags.length ? tags : undefined,
    }),
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
        <aside className="flex w-[220px] shrink-0 animate-pulse flex-col gap-2">
          <div className="h-3 w-16 rounded-sm bg-border" />
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-full rounded-md bg-border" />
            ))}
          </div>
        </aside>
      ) : (
        (!!categories.length || !!popularTags.length) && (
        <aside className="flex w-[220px] shrink-0 flex-col gap-6">
          {!!categories.length && (
            <CategoryList
              label="Kategori"
              icon={LayoutGrid}
              items={categories}
              selected={category ? [category] : []}
              onSelect={(slugs) => setCategory(slugs[0] ?? null)}
            />
          )}
          {!!popularTags.length && (
            <div className="flex flex-col">
              <p className="mb-2 font-heading text-sm font-semibold text-text-primary">Tag</p>
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
                        ? "border-accent bg-accent text-text-on-accent"
                        : "border-border text-text-secondary hover:border-primary hover:bg-border/40 hover:text-text-primary",
                    )}
                  >
                    <TagIcon className="size-3" />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
        )
      )}

      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full max-w-[420px] shrink-0 items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2.5 transition-colors hover:border-primary hover:bg-border/40 focus-within:border-primary focus-within:bg-surface">
            <Search className="size-4 shrink-0 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kreator..."
              className="w-full min-w-0 bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
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
              Urutkan
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
                        ? "bg-accent text-text-on-accent"
                        : "text-text-secondary hover:bg-border/50",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isLoadingInitial && !error && (
          <p className="font-body text-sm text-text-secondary">
            Menampilkan {accumulated.length} dari {grandTotal ?? accumulated.length} kreator
          </p>
        )}

        <div className="flex flex-wrap gap-6">
          {(isLoadingInitial || error || (!hasActiveQuery && accumulated.length === 0)) &&
            Array.from({ length: 8 }).map((_, i) => <CreatorCardSkeleton key={i} />)}
          {!isLoadingInitial && !error && hasActiveQuery && accumulated.length === 0 && (
            <div className="flex w-full flex-col items-center gap-3 py-16 text-center">
              <UserSearch className="size-10 text-text-secondary" />
              <p className="font-body text-sm text-text-secondary">Belum ada kreator ditemukan.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory(null);
                  setTags([]);
                }}
                className="font-body text-sm font-medium text-primary underline"
              >
                Reset pencarian & kategori
              </button>
            </div>
          )}
          {accumulated.map((creator) => (
            <CreatorCard key={creator.slug} creator={creator} />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button variant="secondary" loading={isLoadingMore} onClick={() => setPage((p) => p + 1)}>
              Muat Lebih Banyak
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
