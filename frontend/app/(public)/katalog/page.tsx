"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Search, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import { getProducts } from "@/services/catalog";

export default function KatalogPage() {
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useSWR(["/catalog/products", category], () =>
    getProducts({ category: category ?? undefined, per_page: 40 }),
  );

  const products = useMemo(() => data?.data ?? [], [data]);
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (p.category) map.set(p.category.slug, p.category.name);
    });
    return Array.from(map, ([slug, name]) => ({ slug, name }));
  }, [products]);

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

      <section className="flex flex-col gap-4 border-b border-border px-4 py-4 md:flex-row md:items-center md:justify-between md:px-20">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="flex w-full max-w-[420px] items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2.5 md:w-auto">
            <Search className="size-4 shrink-0 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="w-full bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-text-secondary"
            />
          </div>
          <button onClick={() => setCategory(null)}>
            <Tag>Semua</Tag>
          </button>
          {categories.map((cat) => (
            <button key={cat.slug} onClick={() => setCategory(cat.slug)}>
              <Tag>{cat.name}</Tag>
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 font-body text-sm text-text-secondary">
          <SlidersHorizontal className="size-3.5" />
          Filter
        </button>
      </section>

      <section
        id="product-grid"
        className="mx-auto flex w-full max-w-[1440px] flex-wrap justify-center gap-6 px-4 py-10 md:justify-start md:px-20"
      >
        {isLoading && <p className="font-body text-sm text-text-secondary">Memuat produk...</p>}
        {!isLoading && filtered.length === 0 && (
          <p className="font-body text-sm text-text-secondary">Belum ada produk ditemukan.</p>
        )}
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </div>
  );
}
