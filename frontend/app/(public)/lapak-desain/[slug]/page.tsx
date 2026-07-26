"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, PackageSearch, Star, UserRound } from "lucide-react";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import WishlistButton from "@/components/ui/WishlistButton";
import DesignCard, { DesignCardSkeleton } from "@/components/ui/DesignCard";
import { getDesignBySlug, getCreatorBySlug } from "@/services/marketplace";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import type { Design } from "@/types/product";

export default function DetailDesainPage() {
  const params = useParams<{ slug: string }>();
  const { data, isLoading } = useSWR(`/marketplace/designs/${params.slug}`, () =>
    getDesignBySlug(params.slug),
  );
  const design = data?.data;

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] animate-pulse flex-col gap-8 px-4 py-10 md:flex-row md:px-20">
        <div className="h-[400px] w-full shrink-0 rounded-md bg-border md:w-[480px]" />
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-5 w-24 rounded-full bg-border" />
          <div className="h-8 w-3/4 rounded-sm bg-border" />
          <div className="h-4 w-32 rounded-sm bg-border" />
          <div className="flex flex-col gap-2">
            <div className="h-3.5 w-full rounded-sm bg-border" />
            <div className="h-3.5 w-4/5 rounded-sm bg-border" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-11 w-full rounded-sm bg-border" />
            ))}
          </div>
          <div className="h-11 w-full rounded-sm bg-border" />
        </div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-3 px-4 py-24 text-center md:px-20">
        <PackageSearch className="size-10 text-text-secondary" />
        <p className="font-body text-sm text-text-secondary">Desain tidak ditemukan.</p>
        <Link
          href="/lapak-desain"
          className="font-body text-sm font-medium text-primary underline underline-offset-4"
        >
          Kembali ke Lapak Desain
        </Link>
      </div>
    );
  }

  const thumbnail = storageUrl(design.thumbnail_path);
  const hasRating = !!design.review_count && design.review_count > 0 && design.rating_average != null;
  const hasSold = !!design.sold_count && design.sold_count > 0;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-10 md:px-20">
      <Link
        href="/lapak-desain"
        className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-secondary transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Lapak Desain
      </Link>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="relative h-[400px] w-full shrink-0 overflow-hidden rounded-md bg-border md:w-[480px]">
          {thumbnail && (
            <Image
              src={thumbnail}
              alt={design.title}
              fill
              sizes="(min-width: 768px) 480px, 100vw"
              className="object-cover"
              priority
            />
          )}
          <WishlistButton designId={design.id} className="absolute right-3 top-3" />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          {design.category && <Tag>{design.category.name}</Tag>}
          <h1 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
            {design.title}
          </h1>

          <div className="flex items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-border text-text-secondary">
              <UserRound className="size-4" />
            </span>
            {design.creator.slug ? (
              <Link
                href={`/kreator/${design.creator.slug}`}
                className="font-body text-sm font-medium text-primary hover:underline"
              >
                {design.creator.name}
              </Link>
            ) : (
              <p className="font-body text-sm font-medium text-text-secondary">{design.creator.name}</p>
            )}
          </div>

          {(hasRating || hasSold) && (
            <div className="flex items-center gap-1.5 font-body text-sm text-text-secondary">
              {hasRating && (
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                  {design.rating_average}
                  {!!design.review_count && ` (${design.review_count} ulasan)`}
                </span>
              )}
              {hasRating && hasSold && <span>·</span>}
              {hasSold && <span>{design.sold_count} terjual</span>}
            </div>
          )}

          {!!design.starting_price && (
            <p className="font-heading text-h3 font-semibold text-primary">
              Mulai dari {formatCurrency(design.starting_price)}
            </p>
          )}

          <p className="font-body text-sm text-text-secondary">{design.description}</p>

          {!!design.tags?.length && (
            <div className="flex flex-wrap gap-2">
              {design.tags.map((t) => (
                <Tag key={t.slug}>{t.name}</Tag>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <p className="font-body text-sm font-semibold text-text-primary">
              Pilih Produk untuk Desain Ini
            </p>
            <div className="flex flex-col gap-2">
              {(design.products ?? []).map((product) => (
                <Link
                  key={product.id}
                  href={`/customize/${product.slug}?design=${design.slug}`}
                  className="flex items-center justify-between rounded-sm border border-border px-4 py-3 transition-colors hover:border-primary hover:bg-border/40"
                >
                  <span className="font-body text-sm font-medium text-text-primary">
                    {product.name}
                  </span>
                  <span className="font-body text-sm font-semibold text-text-primary">
                    Mulai dari {formatCurrency(product.base_price)}
                  </span>
                </Link>
              ))}
              {(design.products ?? []).length === 0 && (
                <p className="font-body text-sm text-text-secondary">
                  Belum ada produk yang tersedia untuk desain ini.
                </p>
              )}
            </div>
          </div>

          {design.products && design.products.length > 0 && (
            <Link href={`/customize/${design.products[0].slug}?design=${design.slug}`}>
              <Button fullWidth>Mulai Custom dengan Desain Ini</Button>
            </Link>
          )}
        </div>
      </div>

      {design.creator.slug && (
        <MoreFromCreator
          creatorSlug={design.creator.slug}
          creatorName={design.creator.name}
          excludeId={design.id}
        />
      )}
    </div>
  );
}

function MoreFromCreator({
  creatorSlug,
  creatorName,
  excludeId,
}: {
  creatorSlug: string;
  creatorName: string;
  excludeId: number;
}) {
  const { data, isLoading } = useSWR(["/marketplace/creators", creatorSlug], () =>
    getCreatorBySlug(creatorSlug),
  );
  const designs = (data?.data.designs ?? []).filter((d: Design) => d.id !== excludeId).slice(0, 5);

  if (!isLoading && designs.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
          Desain Lain dari {creatorName}
        </h2>
        <Link
          href={`/kreator/${creatorSlug}`}
          className="shrink-0 font-body text-sm font-medium text-primary transition-colors hover:text-accent hover:underline hover:underline-offset-4"
        >
          Lihat Semua →
        </Link>
      </div>
      <div className="flex flex-wrap gap-6">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <DesignCardSkeleton key={i} />)
          : designs.map((d: Design) => <DesignCard key={d.id} design={d} />)}
      </div>
    </div>
  );
}
