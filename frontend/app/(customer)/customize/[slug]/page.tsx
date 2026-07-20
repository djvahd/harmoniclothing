"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import { Upload } from "lucide-react";
import Tag from "@/components/ui/Tag";
import QuantityStepper from "@/components/ui/QuantityStepper";
import PriceSummaryRow from "@/components/ui/PriceSummaryRow";
import Button from "@/components/ui/Button";
import { getProductBySlug } from "@/services/catalog";
import { getDesignBySlug } from "@/services/marketplace";
import { uploadDesignFile } from "@/services/customization";
import { addToCart } from "@/services/cart";
import { storageUrl } from "@/lib/storage";
import { ApiError } from "@/lib/api";

function ProductEditorForm() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const designSlug = searchParams.get("design");

  const { data: productData } = useSWR(`/catalog/products/${params.slug}`, () =>
    getProductBySlug(params.slug),
  );
  const { data: designData } = useSWR(
    designSlug ? `/marketplace/designs/${designSlug}` : null,
    () => getDesignBySlug(designSlug as string),
  );

  const product = productData?.data;
  const design = designData?.data;

  const colors = useMemo(
    () => Array.from(new Set(product?.variants?.map((v) => v.color) ?? [])),
    [product],
  );
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!color && colors.length > 0) setColor(colors[0]);
  }, [colors, color]);

  const sizesForColor = useMemo(
    () =>
      product?.variants
        ?.filter((v) => v.color === color)
        .map((v) => v.size) ?? [],
    [product, color],
  );

  const selectedVariant = product?.variants?.find(
    (v) => v.color === color && v.size === size,
  );
  const unitPrice = Number(product?.base_price ?? 0) + Number(selectedVariant?.price_modifier ?? 0);
  const total = unitPrice * quantity;
  const previewImage = storageUrl(
    design?.thumbnail_path ?? selectedVariant?.mockup_asset_path ?? product?.variants?.[0]?.mockup_asset_path,
  );

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadDesignFile(file);
      setUploadedPath(data.path);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengunggah file.");
    } finally {
      setUploading(false);
    }
  }

  async function handleAddToCart() {
    if (!selectedVariant) {
      setError("Pilih warna dan ukuran terlebih dahulu.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await addToCart({
        product_variant_id: selectedVariant.id,
        design_id: design?.id,
        quantity,
        custom_design_file_path: uploadedPath ?? undefined,
      });
      await mutate("/cart");
      router.push("/keranjang");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Terjadi kesalahan, coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!product) {
    return <p className="p-8 font-body text-sm text-text-secondary">Memuat produk...</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row md:px-8">
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex gap-4 font-body text-sm font-medium text-text-secondary">
          <span>Depan</span>
          <span>Belakang</span>
          <span>Samping</span>
        </div>
        <div
          className="relative h-[500px] w-full overflow-hidden rounded-md"
          style={{
            background:
              "radial-gradient(circle, #ffffff 0%, #eef1f3 100%)",
          }}
        >
          {previewImage && (
            <Image src={previewImage} alt={product.name} fill className="object-contain p-10" />
          )}
        </div>
        <p className="font-body text-xs text-text-secondary">
          Preview 3D real-time — update otomatis saat warna/desain diubah (belum tersedia,
          menampilkan mockup foto sesuai warna terpilih).
        </p>
      </div>

      <div className="flex w-full flex-col gap-6 md:w-[480px]">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          Kustomisasi {product.name}
        </h1>

        <div className="flex flex-col gap-2">
          <p className="font-body text-sm font-medium text-text-primary">Pilih Warna</p>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setSize(null);
                }}
                aria-label={c}
                className={
                  color === c
                    ? "size-7 rounded-full border-2 border-accent"
                    : "size-7 rounded-full border border-border"
                }
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-body text-sm font-medium text-text-primary">Pilih Ukuran</p>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((s) => (
              <button key={s} onClick={() => setSize(s)}>
                <Tag>
                  <span className={size === s ? "text-accent" : undefined}>{s}</span>
                </Tag>
              </button>
            ))}
          </div>
        </div>

        {design ? (
          <div className="flex items-center gap-3 rounded-sm border border-border p-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-border">
              {previewImage && (
                <Image src={previewImage} alt={design.title} fill className="object-cover" />
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
              Upload Desain Sendiri
            </p>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-sm border border-dashed border-border py-6 text-center">
              <Upload className="size-5 text-text-secondary" />
              <span className="font-body text-xs text-text-secondary">
                {uploading
                  ? "Mengunggah..."
                  : uploadedPath
                    ? "File terunggah - klik untuk ganti"
                    : "Klik atau drag file di sini (PNG/JPG, maks 20MB)"}
              </span>
              <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="font-body text-sm font-medium text-text-primary">Jumlah</p>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </div>

        <div className="border-t border-border pt-4">
          <PriceSummaryRow label="Harga Produk" amount={unitPrice} />
          <PriceSummaryRow label="Total" amount={total} emphasis />
        </div>

        {error && <p className="font-body text-xs text-red-500">{error}</p>}
        <Button fullWidth loading={submitting} onClick={handleAddToCart}>
          Tambah ke Keranjang
        </Button>
      </div>
    </div>
  );
}

export default function ProductEditorPage() {
  return (
    <Suspense fallback={null}>
      <ProductEditorForm />
    </Suspense>
  );
}
