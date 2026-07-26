"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import clsx from "clsx";
import {
  Award,
  ChevronRight,
  PackageSearch,
  Ruler,
  ShieldCheck,
  Star,
  Upload,
  Zap,
} from "lucide-react";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import QuantityStepper from "@/components/ui/QuantityStepper";
import WishlistButton from "@/components/ui/WishlistButton";
import ProductCard, { ProductCardSkeleton } from "@/components/ui/ProductCard";
import { getProductBySlug, getProducts } from "@/services/catalog";
import { uploadDesignFile } from "@/services/customization";
import { addToCart } from "@/services/cart";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import { ApiError } from "@/lib/api";
import type { Product, PrintArea } from "@/types/product";

const PRINT_AREA_LABELS: Record<PrintArea, string> = {
  depan: "Depan",
  belakang: "Belakang",
  lengan: "Lengan",
};

const TABS = [
  { key: "deskripsi", label: "Deskripsi" },
  { key: "spesifikasi", label: "Spesifikasi" },
  { key: "perawatan", label: "Bahan & Perawatan" },
  { key: "pengiriman", label: "Pengiriman" },
  { key: "ulasan", label: "Ulasan" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function DetailProdukPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data, isLoading } = useSWR(`/catalog/products/${params.slug}`, () =>
    getProductBySlug(params.slug),
  );
  const product = data?.data;

  const colors = useMemo(
    () => Array.from(new Set(product?.variants?.map((v) => v.color) ?? [])),
    [product],
  );
  const [color, setColor] = useState<string | null>(null);
  const activeColor = color ?? colors[0] ?? null;

  const sizesForColor = useMemo(
    () => product?.variants?.filter((v) => v.color === activeColor).map((v) => v.size) ?? [],
    [product, activeColor],
  );
  const [size, setSize] = useState<string | null>(null);
  useEffect(() => {
    setSize(null);
  }, [activeColor]);
  const activeSize = size ?? sizesForColor[0] ?? null;

  const selectedVariant = product?.variants?.find(
    (v) => v.color === activeColor && v.size === activeSize,
  );

  const galleryItems = useMemo(() => {
    const seenColors = new Set<string>();
    const items: { key: string; path: string }[] = [];
    product?.variants?.forEach((v) => {
      if (v.mockup_asset_path && !seenColors.has(v.color)) {
        seenColors.add(v.color);
        items.push({ key: v.color, path: v.mockup_asset_path });
      }
    });
    return items;
  }, [product]);
  const [galleryKey, setGalleryKey] = useState<string | null>(null);
  const activeGalleryItem = galleryItems.find((g) => g.key === galleryKey) ?? galleryItems[0];
  const previewImage = storageUrl(activeGalleryItem?.path ?? null);

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<TabKey>("deskripsi");
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [pendingAction, setPendingAction] = useState<"cart" | "buy" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unitPrice = Number(product?.base_price ?? 0) + Number(selectedVariant?.price_modifier ?? 0);
  const total = unitPrice * quantity;

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

  async function handleSubmit(destination: "cart" | "buy") {
    if (!selectedVariant) {
      setError("Pilih warna dan ukuran terlebih dahulu.");
      return;
    }
    setError(null);
    setPendingAction(destination);
    try {
      await addToCart({
        product_variant_id: selectedVariant.id,
        quantity,
        notes: notes || undefined,
        custom_design_file_path: uploadedPath ?? undefined,
      });
      await mutate("/cart");
      router.push(destination === "cart" ? "/keranjang" : "/checkout");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Terjadi kesalahan, coba lagi.");
    } finally {
      setPendingAction(null);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] animate-pulse flex-col gap-8 px-4 py-10 md:px-20">
        <div className="h-4 w-64 rounded-sm bg-border" />
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="h-[460px] w-full shrink-0 rounded-md bg-border md:w-[480px]" />
          <div className="flex flex-1 flex-col gap-4">
            <div className="h-5 w-24 rounded-full bg-border" />
            <div className="h-8 w-3/4 rounded-sm bg-border" />
            <div className="h-4 w-40 rounded-sm bg-border" />
            <div className="h-9 w-full rounded-sm bg-border" />
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
  const isLaris = hasSold && (product.sold_count ?? 0) >= 20;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-10 md:px-20">
      <nav className="flex flex-wrap items-center gap-1.5 font-body text-sm text-text-secondary">
        <Link href="/katalog-produk" className="transition-colors hover:text-primary">
          Katalog Produk
        </Link>
        {product.category && (
          <>
            <ChevronRight className="size-3.5" />
            <Link
              href={`/katalog-produk?kategori=${product.category.slug}`}
              className="transition-colors hover:text-primary"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5" />
        <span className="line-clamp-1 text-text-primary">{product.name}</span>
      </nav>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex w-full shrink-0 flex-col gap-3 md:w-[480px]">
          <div className="relative h-[420px] w-full overflow-hidden rounded-md bg-border">
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
            {isLaris && (
              <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 font-body text-xs font-semibold text-text-on-accent">
                Terlaris
              </span>
            )}
            <WishlistButton productId={product.id} className="absolute right-3 top-3" />
          </div>
          {galleryItems.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {galleryItems.map((item) => {
                const thumb = storageUrl(item.path);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setGalleryKey(item.key);
                      setColor(item.key);
                    }}
                    className={clsx(
                      "relative size-16 shrink-0 overflow-hidden rounded-sm border-2 bg-border transition-colors",
                      (activeGalleryItem?.key ?? galleryItems[0].key) === item.key
                        ? "border-accent"
                        : "border-transparent hover:border-primary/40",
                    )}
                  >
                    {thumb && <Image src={thumb} alt="" fill sizes="64px" className="object-cover" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h1 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
              {product.name}
            </h1>
            {(hasRating || hasSold) && (
              <div className="mt-1 flex flex-wrap items-center gap-1.5 font-body text-sm text-text-secondary">
                {hasRating && (
                  <span className="flex items-center gap-1">
                    <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                    {product.rating_average} ({product.review_count} ulasan)
                  </span>
                )}
                {hasRating && hasSold && <span>·</span>}
                {hasSold && <span>Terjual {product.sold_count} kali</span>}
              </div>
            )}
          </div>

          {colors.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-body text-sm font-medium text-text-primary">
                Pilih Warna Produk{activeColor ? `: ${activeColor}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setColor(c);
                      setGalleryKey(c);
                    }}
                    aria-label={c}
                    aria-pressed={activeColor === c}
                    className={clsx(
                      "size-8 rounded-full border-2 transition-colors",
                      activeColor === c ? "border-accent" : "border-border hover:border-primary/50",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {sizesForColor.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="font-body text-sm font-medium text-text-primary">Pilih Ukuran</p>
                <button
                  type="button"
                  onClick={() => setShowSizeChart((v) => !v)}
                  className="flex items-center gap-1 font-body text-xs text-text-secondary transition-colors hover:text-primary"
                >
                  <Ruler className="size-3.5" />
                  Size Chart
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizesForColor.map((s) => (
                  <button key={s} type="button" onClick={() => setSize(s)}>
                    <Tag active={activeSize === s} size="sm">
                      {s}
                    </Tag>
                  </button>
                ))}
              </div>
              {showSizeChart && (
                <div className="overflow-x-auto rounded-sm border border-border">
                  <table className="w-full font-body text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface text-left text-text-secondary">
                        <th className="px-3 py-2 font-medium">Ukuran</th>
                        <th className="px-3 py-2 font-medium">Lebar Dada (cm)</th>
                        <th className="px-3 py-2 font-medium">Panjang (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["S", "46", "66"],
                        ["M", "49", "69"],
                        ["L", "52", "72"],
                        ["XL", "55", "75"],
                        ["XXL", "58", "78"],
                      ].map(([s, chest, length]) => (
                        <tr key={s} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 text-text-primary">{s}</td>
                          <td className="px-3 py-2 text-text-secondary">{chest}</td>
                          <td className="px-3 py-2 text-text-secondary">{length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="border-t border-border bg-surface px-3 py-2 font-body text-xs text-text-secondary">
                    Ukuran umum, dapat berbeda tipis tergantung jenis produk.
                  </p>
                </div>
              )}
            </div>
          )}

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
              <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleUpload} />
            </label>
            <Link
              href="/lapak-desain"
              className="font-body text-sm font-medium text-primary transition-colors hover:underline"
            >
              atau pilih desain siap pakai dari Lapak Desain →
            </Link>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="font-body text-sm font-medium text-text-primary">Jumlah</p>
            <QuantityStepper value={quantity} onChange={setQuantity} />
          </div>

          <p className="font-heading text-h3 font-semibold text-primary">{formatCurrency(total)}</p>

          <div className="flex flex-col gap-2">
            <p className="font-body text-sm font-medium text-text-primary">Catatan (opsional)</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none"
              placeholder="Permintaan revisi/khusus untuk produk ini..."
            />
          </div>

          {error && <p className="font-body text-xs text-red-500">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              fullWidth
              loading={pendingAction === "cart"}
              disabled={pendingAction !== null}
              onClick={() => handleSubmit("cart")}
            >
              Tambah ke Keranjang
            </Button>
            <Button
              variant="secondary"
              fullWidth
              loading={pendingAction === "buy"}
              disabled={pendingAction !== null}
              onClick={() => handleSubmit("buy")}
            >
              Beli Sekarang
            </Button>
          </div>

          <div className="flex flex-wrap gap-5 border-t border-border pt-4">
            <div className="flex items-center gap-2 font-body text-xs text-text-secondary">
              <Zap className="size-4 text-primary" />
              Produksi Cepat
            </div>
            <div className="flex items-center gap-2 font-body text-xs text-text-secondary">
              <Award className="size-4 text-primary" />
              Kualitas Premium
            </div>
            <div className="flex items-center gap-2 font-body text-xs text-text-secondary">
              <ShieldCheck className="size-4 text-primary" />
              Garansi Kepuasan
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={clsx(
                "relative px-4 py-3 font-heading text-sm font-semibold transition-colors",
                tab === t.key ? "text-primary" : "text-text-secondary hover:text-text-primary",
              )}
            >
              {t.key === "ulasan" && product.review_count ? `${t.label} (${product.review_count})` : t.label}
              {tab === t.key && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        <div className="font-body text-sm text-text-secondary">
          {tab === "deskripsi" && <p>{product.description}</p>}
          {tab === "spesifikasi" &&
            (selectedVariant ? (
              <ul className="flex flex-col gap-1">
                <li>Bahan: {selectedVariant.material}</li>
                <li>Jenis potongan: {selectedVariant.cut_type}</li>
                {!!selectedVariant.print_areas?.length && (
                  <li>
                    Area cetak: {selectedVariant.print_areas.map((a) => PRINT_AREA_LABELS[a]).join(", ")}
                  </li>
                )}
              </ul>
            ) : (
              <p>Pilih warna dan ukuran untuk melihat spesifikasi.</p>
            ))}
          {tab === "perawatan" && (
            <p>
              Gunakan air dingin dan deterjen lembut, jangan gunakan pemutih, jemur di tempat teduh,
              dan setrika suhu rendah pada bagian dalam untuk menjaga hasil sablon tetap awet.
            </p>
          )}
          {tab === "pengiriman" && (
            <p>
              Produk umumnya diproduksi 1–3 hari kerja setelah pesanan dikonfirmasi, lalu dikirim ke
              seluruh Indonesia menggunakan kurir pilihanmu saat checkout. Estimasi tiba mengikuti
              layanan kurir yang dipilih.
            </p>
          )}
          {tab === "ulasan" &&
            (hasRating ? (
              <p>
                Rating {product.rating_average} dari {product.review_count} ulasan pembeli. Daftar
                ulasan lengkap akan tampil di sini setelah fitur listing ulasan tersedia.
              </p>
            ) : (
              <p>Belum ada ulasan untuk produk ini.</p>
            ))}
        </div>
      </div>

      <YouMightLike categorySlug={product.category?.slug} excludeId={product.id} />
    </div>
  );
}

function YouMightLike({ categorySlug, excludeId }: { categorySlug?: string; excludeId: number }) {
  const { data, isLoading } = useSWR(["/catalog/products", "you-might-like", categorySlug], () =>
    getProducts(categorySlug ? { categories: [categorySlug], per_page: 8 } : { sort: "terlaris", per_page: 8 }),
  );
  const items = (data?.data ?? []).filter((p: Product) => p.id !== excludeId).slice(0, 6);

  if (!isLoading && items.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
          Kamu Mungkin Suka
        </h2>
        <Link
          href={categorySlug ? `/katalog-produk?kategori=${categorySlug}` : "/katalog-produk"}
          className="shrink-0 font-body text-sm font-medium text-primary transition-colors hover:text-accent hover:underline hover:underline-offset-4"
        >
          Lihat Semua →
        </Link>
      </div>
      <div className="flex flex-wrap gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : items.map((p: Product) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
