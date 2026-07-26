"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import clsx from "clsx";
import { ArrowLeft, PackageSearch, Star } from "lucide-react";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import WishlistButton from "@/components/ui/WishlistButton";
import ProductCard, { ProductCardSkeleton } from "@/components/ui/ProductCard";
import { getProductBySlug, getProducts } from "@/services/catalog";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/product";

export default function DetailProdukPage() {
  const params = useParams<{ slug: string }>();
  const { data, isLoading } = useSWR(`/catalog/products/${params.slug}`, () =>
    getProductBySlug(params.slug),
  );
  const product = data?.data;

  const colors = useMemo(
    () => Array.from(new Set(product?.variants?.map((v) => v.color) ?? [])),
    [product],
  );
  const sizes = useMemo(
    () => Array.from(new Set(product?.variants?.map((v) => v.size) ?? [])),
    [product],
  );
  const [color, setColor] = useState<string | null>(null);
  const activeColor = color ?? colors[0];
  const previewVariant = product?.variants?.find((v) => v.color === activeColor);
  const previewImage = storageUrl(previewVariant?.mockup_asset_path);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] animate-pulse flex-col gap-8 px-4 py-10 md:flex-row md:px-20">
        <div className="h-[420px] w-full shrink-0 rounded-md bg-border md:w-[480px]" />
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-5 w-24 rounded-full bg-border" />
          <div className="h-8 w-3/4 rounded-sm bg-border" />
          <div className="h-6 w-1/3 rounded-sm bg-border" />
          <div className="flex flex-col gap-2">
            <div className="h-3.5 w-full rounded-sm bg-border" />
            <div className="h-3.5 w-4/5 rounded-sm bg-border" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="size-7 rounded-full bg-border" />
            ))}
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <div className="h-11 w-full rounded-sm bg-border" />
            <div className="h-11 w-full rounded-sm bg-border" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-3 px-4 py-24 text-center md:px-20">
        <PackageSearch className="size-10 text-text-secondary" />
        <p className="font-body text-sm text-text-secondary">Produk tidak ditemukan.</p>
        <Link
          href="/katalog-produk"
          className="font-body text-sm font-medium text-primary underline underline-offset-4"
        >
          Kembali ke Katalog Produk
        </Link>
      </div>
    );
  }

  const hasRating = !!product.review_count && product.review_count > 0 && product.rating_average != null;
  const hasSold = !!product.sold_count && product.sold_count > 0;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-10 md:px-20">
      <Link
        href="/katalog-produk"
        className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-secondary transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Katalog Produk
      </Link>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="relative h-[420px] w-full shrink-0 overflow-hidden rounded-md bg-border md:w-[480px]">
          {previewImage && (
            <Image
              src={previewImage}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 480px, 100vw"
              className="object-cover"
              priority
            />
          )}
          <WishlistButton productId={product.id} className="absolute right-3 top-3" />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          {product.category && <Tag>{product.category.name}</Tag>}
          <h1 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
            {product.name}
          </h1>

          {(hasRating || hasSold) && (
            <div className="flex items-center gap-1.5 font-body text-sm text-text-secondary">
              {hasRating && (
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                  {product.rating_average}
                  {!!product.review_count && ` (${product.review_count} ulasan)`}
                </span>
              )}
              {hasRating && hasSold && <span>·</span>}
              {hasSold && <span>{product.sold_count} terjual</span>}
            </div>
          )}

          <p className="font-heading text-h3 font-semibold text-primary">
            Mulai dari {formatCurrency(product.base_price)}
          </p>
          <p className="font-body text-sm text-text-secondary">{product.description}</p>

          {colors.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-body text-sm font-medium text-text-primary">
                Warna Tersedia{activeColor ? `: ${activeColor}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={c}
                    aria-pressed={activeColor === c}
                    className={clsx(
                      "size-7 rounded-full border-2 transition-colors",
                      activeColor === c ? "border-accent" : "border-border hover:border-primary/50",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-body text-sm font-medium text-text-primary">Ukuran Tersedia</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <Link href={`/customize/${product.slug}`}>
              <Button fullWidth>Custom Desain Sendiri</Button>
            </Link>
            <Link href="/lapak-desain">
              <Button variant="secondary" fullWidth>
                Pakai Desain dari Lapak Desain
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {product.category && (
        <RelatedProducts
          categorySlug={product.category.slug}
          categoryName={product.category.name}
          excludeId={product.id}
        />
      )}
    </div>
  );
}

function RelatedProducts({
  categorySlug,
  categoryName,
  excludeId,
}: {
  categorySlug: string;
  categoryName: string;
  excludeId: number;
}) {
  const { data, isLoading } = useSWR(["/catalog/products", "related", categorySlug], () =>
    getProducts({ categories: [categorySlug], per_page: 6 }),
  );
  const related = (data?.data ?? []).filter((p: Product) => p.id !== excludeId).slice(0, 5);

  if (!isLoading && related.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
          Produk Lainnya di {categoryName}
        </h2>
        <Link
          href={`/katalog-produk?kategori=${categorySlug}`}
          className="shrink-0 font-body text-sm font-medium text-primary transition-colors hover:text-accent hover:underline hover:underline-offset-4"
        >
          Lihat Semua →
        </Link>
      </div>
      <div className="flex flex-wrap gap-6">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : related.map((p: Product) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
