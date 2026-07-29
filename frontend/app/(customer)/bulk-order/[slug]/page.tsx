"use client";

import { Suspense, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import QuantityStepper from "@/components/ui/QuantityStepper";
import PriceSummaryRow from "@/components/ui/PriceSummaryRow";
import LoadingState from "@/components/ui/LoadingState";
import DetailNotFound from "@/components/product/DetailNotFound";
import { uploadDesignFile } from "@/services/customization";
import { useProduct } from "@/hooks/useProducts";
import { useDesign } from "@/hooks/useDesigns";
import { useBulkPricingTiers, findBulkTier } from "@/hooks/useBulkPricing";
import { useBulkOrderStore } from "@/store/bulk-order-store";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";

/** Flow 7 — Pemesanan Bulk Order: pick a design + quantity per size across every variant of one product, priced by ONE tier from the combined total (BR-012). */
function BulkOrderForm() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const designSlug = searchParams.get("design");

  const { product, isLoading } = useProduct(params.slug);
  const { design } = useDesign(designSlug);
  const { tiers } = useBulkPricingTiers();
  const setDraft = useBulkOrderStore((s) => s.setDraft);

  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const variantsByColor = useMemo(() => {
    const groups = new Map<string, NonNullable<typeof product>["variants"]>();
    product?.variants?.forEach((v) => {
      if (!groups.has(v.color)) groups.set(v.color, []);
      groups.get(v.color)!.push(v);
    });
    return Array.from(groups.entries());
  }, [product]);

  const totalQuantity = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const currentTier = findBulkTier(tiers, totalQuantity);
  const subtotal = currentTier ? currentTier.price_per_unit * totalQuantity : 0;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadDesignFile(file);
      setUploadedPath(data.path);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal mengunggah file."));
    } finally {
      setUploading(false);
    }
  }

  function handleContinue() {
    if (!product) return;
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([variantId, quantity]) => {
        const variant = product.variants?.find((v) => v.id === Number(variantId));
        return {
          productVariantId: Number(variantId),
          color: variant?.color ?? "",
          size: variant?.size ?? "",
          quantity,
        };
      });

    if (items.length === 0) {
      setError("Isi kuantitas minimal satu ukuran.");
      return;
    }
    if (!currentTier) {
      setError("Total kuantitas belum memenuhi tingkat harga Bulk Order manapun.");
      return;
    }
    setError(null);
    setDraft({
      productSlug: product.slug,
      productName: product.name,
      items,
      designId: design?.id ?? null,
      designTitle: design?.title ?? null,
      customDesignFilePath: uploadedPath,
      notes,
    });
    router.push("/checkout/bulk");
  }

  if (isLoading) {
    return <LoadingState variant="detail" />;
  }

  if (!product) {
    return (
      <DetailNotFound
        message="Produk tidak ditemukan."
        backHref="/catalog"
        backLabel="Kembali ke Katalog Produk"
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-8 md:flex-row md:px-20">
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="font-heading text-h3 font-semibold text-text-primary">
            Bulk Order — {product.name}
          </h1>
          <p className="font-body text-sm text-text-secondary">
            Isi kuantitas untuk tiap kombinasi warna/ukuran. Harga per-unit ditentukan dari TOTAL
            kuantitas seluruh kombinasi (BR-012), bukan per-ukuran.
          </p>
        </div>

        {design ? (
          <div className="flex items-center gap-3 rounded-sm border border-border p-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-border">
              {design.thumbnail_path && (
                <Image
                  src={storageUrl(design.thumbnail_path)!}
                  alt={design.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex flex-col">
              <p className="font-body text-sm font-semibold text-text-primary">{design.title}</p>
              <p className="font-body text-xs text-text-secondary">by {design.creator.name}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="font-body text-sm font-medium text-text-primary">
              Upload Desain Sendiri (opsional)
            </p>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-sm border border-dashed border-border py-5 text-center transition-colors hover:border-primary/50">
              <Upload className="size-5 text-text-secondary" />
              <span className="font-body text-xs text-text-secondary">
                {uploading
                  ? "Mengunggah..."
                  : uploadedPath
                    ? "File terunggah — klik untuk ganti"
                    : "Klik atau drag file di sini (PNG/JPG, maks 20MB)"}
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleUpload}
              />
            </label>
            <Link
              href="/marketplace"
              className="font-body text-sm font-medium text-primary transition-colors hover:underline"
            >
              atau pilih desain siap pakai dari Lapak Desain →
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {variantsByColor.map(([color, variants]) => (
            <div key={color} className="flex flex-col gap-2 rounded-md border border-border p-4">
              <p className="font-body text-sm font-semibold text-text-primary">{color}</p>
              <div className="flex flex-col divide-y divide-border">
                {variants?.map((v) => (
                  <div key={v.id} className="flex items-center justify-between py-2">
                    <span className="font-body text-sm text-text-secondary">{v.size}</span>
                    <QuantityStepper
                      min={0}
                      value={quantities[v.id] ?? 0}
                      onChange={(qty) => setQuantities((prev) => ({ ...prev, [v.id]: qty }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-body text-sm font-medium text-text-primary">Catatan (opsional)</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none"
            placeholder="Permintaan revisi/khusus untuk produk ini..."
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-md border border-border bg-surface p-5 md:w-[320px]">
        <p className="font-heading text-lg font-semibold text-text-primary">Tingkat Harga Bulk</p>
        <div className="flex flex-col gap-1.5">
          {tiers.map((t) => (
            <div
              key={t.min_qty}
              className={clsx(
                "flex items-center justify-between rounded-sm px-2.5 py-1.5 font-body text-sm",
                currentTier?.min_qty === t.min_qty
                  ? "bg-accent/10 font-semibold text-primary"
                  : "text-text-secondary",
              )}
            >
              <span>
                {t.min_qty}
                {t.max_qty ? `–${t.max_qty}` : "+"} pcs
              </span>
              <span>{formatCurrency(t.price_per_unit)}/pcs</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3">
          <PriceSummaryRow label="Total Kuantitas" amount={totalQuantity} />
          <PriceSummaryRow label="Total Harga" amount={subtotal} emphasis />
        </div>

        {error && <p className="font-body text-xs text-danger">{error}</p>}
        <Button fullWidth onClick={handleContinue}>
          Lanjut ke Checkout Bulk
        </Button>
      </div>
    </div>
  );
}

export default function BulkOrderPage() {
  return (
    <Suspense fallback={null}>
      <BulkOrderForm />
    </Suspense>
  );
}
