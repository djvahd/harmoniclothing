"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import { getProductBySlug } from "@/services/catalog";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";

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
  const [color, setColor] = useState<string | null>(null);
  const activeColor = color ?? colors[0];
  const previewVariant = product?.variants?.find((v) => v.color === activeColor);
  const previewImage = storageUrl(previewVariant?.mockup_asset_path);

  if (isLoading) {
    return <p className="p-8 font-body text-sm text-text-secondary">Memuat produk...</p>;
  }
  if (!product) {
    return <p className="p-8 font-body text-sm text-text-secondary">Produk tidak ditemukan.</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-10 md:flex-row md:px-20">
      <div className="relative h-[420px] w-full shrink-0 overflow-hidden rounded-md bg-border md:w-[480px]">
        {previewImage && (
          <Image src={previewImage} alt={product.name} fill className="object-cover" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4">
        {product.category && <Tag>{product.category.name}</Tag>}
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{product.name}</h1>
        <p className="font-heading text-xl font-semibold text-primary">
          Mulai dari {formatCurrency(product.base_price)}
        </p>
        <p className="font-body text-sm text-text-secondary">{product.description}</p>

        {colors.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-body text-sm font-medium text-text-primary">Warna Tersedia</p>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={c}
                  className={
                    activeColor === c
                      ? "size-7 rounded-full border-2 border-accent"
                      : "size-7 rounded-full border border-border"
                  }
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <Link href={`/customize/${product.slug}`}>
            <Button fullWidth>Custom Desain Sendiri</Button>
          </Link>
          <Link href="/marketplace-desain">
            <Button variant="secondary" fullWidth>
              Pakai Desain dari Lapak Desain
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
