"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { ArrowUpDown, Search } from "lucide-react";
import clsx from "clsx";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import FilterSidebar, { EMPTY_FILTER_VALUE, type FilterSidebarValue } from "@/components/ui/FilterSidebar";
import { getProducts, getCatalogFilters, type ProductSort } from "@/services/catalog";

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
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (kategoriParam) {
      setFilters((f) =>
        f.categories.includes(kategoriParam) ? f : { ...f, categories: [kategoriParam] },
      );
    }
  }, [kategoriParam]);

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

  const { data, isLoading } = useSWR(["/catalog/products", sort, filters], () =>
    getProducts({
      per_page: 40,
      sort,
      categories: filters.categories.length ? filters.categories : undefined,
      genders: filters.genders.length ? filters.genders : undefined,
      sizes: filters.sizes.length ? filters.sizes : undefined,
      colors: filters.colors.length ? filters.colors : undefined,
      print_areas: filters.printAreas.length ? filters.printAreas : undefined,
      price_min: filters.priceMin ? Number(filters.priceMin) : undefined,
      price_max: filters.priceMax ? Number(filters.priceMax) : undefined,
    }),
  );

  const products = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(
    () =>
      search
        ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        : products,
    [products, search],
  );

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
              <Button variant="secondary">Lihat Marketplace</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 md:flex-row md:px-20">
        <FilterSidebar options={filterOptions} value={filters} onChange={setFilters} />

        <div className="flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full max-w-[420px] items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2.5">
              <Search className="size-4 shrink-0 text-text-secondary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk..."
                className="w-full bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary"
              />
            </div>

            <div ref={sortRef} className="relative">
              <button
                onClick={() => setShowSort((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 font-body text-sm text-text-secondary transition-colors hover:border-primary/40 hover:text-text-primary"
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
                          ? "bg-primary text-text-on-accent"
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

          <div id="product-grid" className="flex flex-wrap gap-6">
            {isLoading && <p className="font-body text-sm text-text-secondary">Memuat produk...</p>}
            {!isLoading && filtered.length === 0 && (
              <p className="font-body text-sm text-text-secondary">
                Belum ada produk ditemukan untuk filter ini.
              </p>
            )}
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
