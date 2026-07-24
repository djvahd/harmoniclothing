"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { ArrowUpDown, PackageSearch, Search, X } from "lucide-react";
import clsx from "clsx";
import ProductCard, { ProductCardSkeleton } from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import FilterSidebar, { EMPTY_FILTER_VALUE, type FilterSidebarValue } from "@/components/ui/FilterSidebar";
import { getProducts, getCatalogFilters, type ProductSort } from "@/services/catalog";
import type { Product } from "@/types/product";

const PER_PAGE = 40;

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "terbaru", label: "Terbaru" },
  { value: "harga_asc", label: "Harga: Rendah ke Tinggi" },
  { value: "harga_desc", label: "Harga: Tinggi ke Rendah" },
  { value: "terlaris", label: "Terlaris" },
  { value: "rating", label: "Rating Tertinggi" },
];

export default function KatalogPage() {
  const searchParams = useSearchParams();
  const kategoriParam = searchParams.get("kategori");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProductSort>("terbaru");
  const [filters, setFilters] = useState<FilterSidebarValue>(() =>
    kategoriParam ? { ...EMPTY_FILTER_VALUE, categories: [kategoriParam] } : EMPTY_FILTER_VALUE,
  );
  const [showSort, setShowSort] = useState(false);
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<Product[]>([]);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (kategoriParam) {
      setFilters((f) =>
        f.categories.includes(kategoriParam) ? f : { ...f, categories: [kategoriParam] },
      );
    }
  }, [kategoriParam]);

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

  const { data: filtersData } = useSWR("/catalog/products/filters", getCatalogFilters);
  const filterOptions = filtersData?.data;

  // Unfiltered grand total for the "Menampilkan X dari Y produk" count — Y
  // is the whole catalog, not the filtered result set, so this is fetched
  // independently of `filters`/`sort`.
  const { data: totalData } = useSWR("/catalog/products/total", () => getProducts({ per_page: 1 }));
  const grandTotal = totalData?.meta.total;

  const { data, error, isLoading } = useSWR(["/catalog/products", sort, filters, page], () =>
    getProducts({
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
    }),
  );

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
      <section className="flex flex-col gap-6 bg-surface px-4 py-10 md:flex-row md:items-center md:justify-between md:px-20">
        <div className="flex max-w-xl flex-col gap-4">
          <h1 className="font-heading text-h3 font-semibold text-text-primary md:text-h1">
            Katalog Produk
          </h1>
          <p className="font-body text-sm text-text-secondary md:text-base">
            Pilih dari berbagai jenis produk blank berkualitas tinggi, siap kamu kustomisasi
            sesuai keinginan sendiri.
          </p>
          <div className="flex gap-3">
            <a href="#product-grid">
              <Button variant="primary">Mulai Custom Design</Button>
            </a>
            <Link href="/marketplace-desain">
              <Button variant="secondary">Lihat Desain</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 md:flex-row md:px-20">
        <FilterSidebar options={filterOptions} value={filters} onChange={setFilters} />

        <div className="flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full max-w-[420px] shrink-0 items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2.5 transition-colors hover:border-primary hover:bg-border/40 focus-within:border-primary focus-within:bg-surface">
              <Search className="size-4 shrink-0 text-text-secondary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk..."
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
              Menampilkan {filtered.length} dari {grandTotal ?? filtered.length} produk
            </p>
          )}

          <div id="product-grid" className="flex flex-wrap gap-6">
            {(isLoadingInitial || error || (!hasActiveQuery && filtered.length === 0)) &&
              Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            {!isLoadingInitial && !error && hasActiveQuery && filtered.length === 0 && (
              <div className="flex w-full flex-col items-center gap-3 py-16 text-center">
                <PackageSearch className="size-10 text-text-secondary" />
                <p className="font-body text-sm text-text-secondary">
                  Belum ada produk ditemukan untuk filter ini.
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
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
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
    </div>
  );
}
