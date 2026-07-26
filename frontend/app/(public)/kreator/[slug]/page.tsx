"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { ExternalLink, LayoutGrid, PackageSearch, Star, UserRound } from "lucide-react";
import DesignCard, { DesignCardSkeleton } from "@/components/ui/DesignCard";
import { getCreatorBySlug } from "@/services/marketplace";
import type { Design } from "@/types/product";

export default function ProfilPublikCreatorPage() {
  const params = useParams<{ slug: string }>();
  const { data, isLoading } = useSWR(`/marketplace/creators/${params.slug}`, () =>
    getCreatorBySlug(params.slug),
  );
  const creator = data?.data;

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] animate-pulse flex-col gap-8 px-4 py-10 md:px-20">
        <div className="flex items-center gap-4">
          <div className="size-20 shrink-0 rounded-full bg-border" />
          <div className="flex flex-col gap-2">
            <div className="h-6 w-48 rounded-sm bg-border" />
            <div className="h-4 w-32 rounded-sm bg-border" />
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <DesignCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-3 px-4 py-24 text-center md:px-20">
        <PackageSearch className="size-10 text-text-secondary" />
        <p className="font-body text-sm text-text-secondary">Kreator tidak ditemukan.</p>
        <Link
          href="/lapak-desain?tab=creator"
          className="font-body text-sm font-medium text-primary underline underline-offset-4"
        >
          Kembali ke Lapak Desain
        </Link>
      </div>
    );
  }

  const totalSold = creator.designs.reduce((sum, d: Design) => sum + (d.sold_count ?? 0), 0);
  const ratings = creator.designs
    .map((d: Design) => d.rating_average)
    .filter((r): r is number => r != null);
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-10 md:px-20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-border text-text-secondary">
            <UserRound className="size-8" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-h3 font-semibold text-text-primary">{creator.name}</h1>
            {creator.since && (
              <p className="font-body text-sm text-text-secondary">
                Kreator sejak{" "}
                {new Date(creator.since).toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
            {creator.bio && (
              <p className="max-w-lg font-body text-sm text-text-secondary">{creator.bio}</p>
            )}
            {creator.portfolio_url && (
              <a
                href={creator.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center gap-1 font-body text-sm font-medium text-primary transition-colors hover:underline"
              >
                Lihat Portofolio
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col items-center gap-1">
            <LayoutGrid className="size-4 text-text-secondary" />
            <p className="font-heading text-lg font-semibold text-text-primary">
              {creator.designs.length}
            </p>
            <p className="font-body text-xs text-text-secondary">Desain</p>
          </div>
          {avgRating != null && (
            <div className="flex flex-col items-center gap-1">
              <Star className="size-4 text-text-secondary" />
              <p className="font-heading text-lg font-semibold text-text-primary">
                {avgRating.toFixed(1)}
              </p>
              <p className="font-body text-xs text-text-secondary">Rating</p>
            </div>
          )}
          <div className="flex flex-col items-center gap-1">
            <PackageSearch className="size-4 text-text-secondary" />
            <p className="font-heading text-lg font-semibold text-text-primary">{totalSold}</p>
            <p className="font-body text-xs text-text-secondary">Total Terjual</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="font-heading text-lg font-semibold text-text-primary">
          Desain oleh {creator.name} ({creator.designs.length})
        </p>
        {creator.designs.length === 0 ? (
          <div className="flex w-full flex-col items-center gap-3 py-16 text-center">
            <PackageSearch className="size-10 text-text-secondary" />
            <p className="font-body text-sm text-text-secondary">Belum ada desain yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6">
            {creator.designs.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
