"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Button from "@/components/ui/Button";
import { getDesignBySlug } from "@/services/marketplace";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";

export default function DetailDesainPage() {
  const params = useParams<{ slug: string }>();
  const { data, isLoading } = useSWR(`/marketplace/designs/${params.slug}`, () =>
    getDesignBySlug(params.slug),
  );
  const design = data?.data;

  if (isLoading) {
    return <p className="p-8 font-body text-sm text-text-secondary">Memuat desain...</p>;
  }
  if (!design) {
    return <p className="p-8 font-body text-sm text-text-secondary">Desain tidak ditemukan.</p>;
  }

  const thumbnail = storageUrl(design.thumbnail_path);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:px-8">
      <div className="relative h-[400px] w-full shrink-0 overflow-hidden rounded-md bg-border md:w-[480px]">
        {thumbnail && <Image src={thumbnail} alt={design.title} fill className="object-cover" />}
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">{design.title}</h1>
        {design.creator.slug ? (
          <Link
            href={`/kreator/${design.creator.slug}`}
            className="font-body text-sm font-medium text-primary"
          >
            by {design.creator.name}
          </Link>
        ) : (
          <p className="font-body text-sm font-medium text-text-secondary">
            by {design.creator.name}
          </p>
        )}
        <p className="font-body text-sm text-text-secondary">{design.description}</p>

        <div className="flex flex-col gap-3">
          <p className="font-body text-sm font-semibold text-text-primary">
            Pilih Produk untuk Desain Ini
          </p>
          <div className="flex flex-col gap-2">
            {(design.products ?? []).map((product) => (
              <Link
                key={product.id}
                href={`/customize/${product.slug}?design=${design.slug}`}
                className="flex items-center justify-between rounded-sm border border-border px-4 py-3"
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
  );
}
