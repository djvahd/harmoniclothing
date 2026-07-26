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
  LayoutGrid,
  Package,
  PackageSearch,
  Ruler,
  ShieldCheck,
  Star,
  UserRound,
  Zap,
} from "lucide-react";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import QuantityStepper from "@/components/ui/QuantityStepper";
import WishlistButton from "@/components/ui/WishlistButton";
import DesignCard, { DesignCardSkeleton } from "@/components/ui/DesignCard";
import { getDesignBySlug, getCreatorBySlug, getDesigns } from "@/services/marketplace";
import { addToCart } from "@/services/cart";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import { ApiError } from "@/lib/api";
import type { Design, Product, PrintArea } from "@/types/product";

// Display-only estimate mirroring backend's config('creator.commission_rate')
// placeholder default (backend/config/creator.php) — the real rate isn't
// exposed by any API, so this is cosmetic, not the value actually applied
// at checkout.
const CREATOR_ROYALTY_RATE = 0.2;

const PRINT_AREA_LABELS: Record<PrintArea, string> = {
  depan: "Depan",
  belakang: "Belakang",
  lengan: "Lengan",
};

const TABS = [
  { key: "deskripsi", label: "Deskripsi" },
  { key: "produk", label: "Detail Produk" },
  { key: "perawatan", label: "Bahan & Perawatan" },
  { key: "pengiriman", label: "Pengiriman" },
  { key: "ulasan", label: "Ulasan" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function DetailDesainPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data, isLoading } = useSWR(`/marketplace/designs/${params.slug}`, () =>
    getDesignBySlug(params.slug),
  );
  const design = data?.data;
  const products = useMemo(() => design?.products ?? [], [design]);

  const [productId, setProductId] = useState<number | null>(null);
  useEffect(() => {
    setProductId(products[0]?.id ?? null);
  }, [products]);
  const selectedProduct = products.find((p) => p.id === productId) ?? products[0];

  const colors = useMemo(
    () => Array.from(new Set(selectedProduct?.variants?.map((v) => v.color) ?? [])),
    [selectedProduct],
  );
  const [color, setColor] = useState<string | null>(null);
  useEffect(() => {
    setColor(null);
  }, [selectedProduct?.id]);
  const activeColor = color ?? colors[0] ?? null;

  const sizesForColor = useMemo(
    () => selectedProduct?.variants?.filter((v) => v.color === activeColor).map((v) => v.size) ?? [],
    [selectedProduct, activeColor],
  );
  const [size, setSize] = useState<string | null>(null);
  useEffect(() => {
    setSize(null);
  }, [activeColor]);
  const activeSize = size ?? sizesForColor[0] ?? null;

  const selectedVariant = selectedProduct?.variants?.find(
    (v) => v.color === activeColor && v.size === activeSize,
  );

  const galleryItems = useMemo(() => {
    const items: { key: string; path: string }[] = [];
    if (design?.thumbnail_path) items.push({ key: "__design", path: design.thumbnail_path });
    const seenColors = new Set<string>();
    selectedProduct?.variants?.forEach((v) => {
      if (v.mockup_asset_path && !seenColors.has(v.color)) {
        seenColors.add(v.color);
        items.push({ key: v.color, path: v.mockup_asset_path });
      }
    });
    return items;
  }, [design, selectedProduct]);
  const [galleryKey, setGalleryKey] = useState<string | null>(null);
  useEffect(() => {
    setGalleryKey(null);
  }, [selectedProduct?.id]);
  const activeGalleryItem = galleryItems.find((g) => g.key === galleryKey) ?? galleryItems[0];
  const previewImage = storageUrl(activeGalleryItem?.path ?? null);

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [tab, setTab] = useState<TabKey>("deskripsi");
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [pendingAction, setPendingAction] = useState<"cart" | "buy" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unitPrice = Number(selectedProduct?.base_price ?? 0) + Number(selectedVariant?.price_modifier ?? 0);
  const royalty = Math.round(unitPrice * CREATOR_ROYALTY_RATE);
  const total = unitPrice * quantity;

  async function handleSubmit(destination: "cart" | "buy") {
    if (!selectedVariant || !design) {
      setError("Pilih warna dan ukuran terlebih dahulu.");
      return;
    }
    setError(null);
    setPendingAction(destination);
    try {
      await addToCart({
        product_variant_id: selectedVariant.id,
        design_id: design.id,
        quantity,
        notes: notes || undefined,
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

  const hasRating = !!design.review_count && design.review_count > 0 && design.rating_average != null;
  const hasSold = !!design.sold_count && design.sold_count > 0;
  const isLaris = hasSold && (design.sold_count ?? 0) >= 20;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-10 md:px-20">
      <nav className="flex flex-wrap items-center gap-1.5 font-body text-sm text-text-secondary">
        <Link href="/lapak-desain" className="transition-colors hover:text-primary">
          Lapak Desain
        </Link>
        {design.category && (
          <>
            <ChevronRight className="size-3.5" />
            <Link
              href={`/lapak-desain?kategori=${design.category.slug}`}
              className="transition-colors hover:text-primary"
            >
              {design.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5" />
        <span className="line-clamp-1 text-text-primary">{design.title}</span>
      </nav>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex w-full shrink-0 flex-col gap-3 md:w-[480px]">
          <div className="relative h-[420px] w-full overflow-hidden rounded-md bg-border">
            {previewImage && (
              <Image
                src={previewImage}
                alt={design.title}
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
            <WishlistButton designId={design.id} className="absolute right-3 top-3" />
          </div>
          {galleryItems.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {galleryItems.map((item) => {
                const thumb = storageUrl(item.path);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setGalleryKey(item.key)}
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
              {design.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 font-body text-sm text-text-secondary">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-border text-text-secondary">
                <UserRound className="size-3.5" />
              </span>
              {design.creator.slug ? (
                <Link
                  href={`/kreator/${design.creator.slug}`}
                  className="font-medium text-primary hover:underline"
                >
                  {design.creator.name}
                </Link>
              ) : (
                <span className="font-medium text-text-primary">{design.creator.name}</span>
              )}
              {(hasRating || hasSold) && <span>·</span>}
              {hasRating && (
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                  {design.rating_average} ({design.review_count} ulasan)
                </span>
              )}
              {hasRating && hasSold && <span>·</span>}
              {hasSold && <span>Terjual {design.sold_count} kali</span>}
            </div>
          </div>

          {products.length === 0 ? (
            <p className="font-body text-sm text-text-secondary">
              Belum ada produk yang tersedia untuk desain ini.
            </p>
          ) : (
            <>
              {products.length > 1 && (
                <div className="flex flex-col gap-2">
                  <p className="font-body text-sm font-medium text-text-primary">Pilih Produk</p>
                  <div className="flex flex-wrap gap-2">
                    {products.map((p: Product) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProductId(p.id)}
                        className={clsx(
                          "flex flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-left transition-colors",
                          p.id === selectedProduct?.id
                            ? "border-accent bg-accent/5"
                            : "border-border hover:border-primary/40",
                        )}
                      >
                        <span className="font-body text-sm font-medium text-text-primary">{p.name}</span>
                        <span className="font-body text-xs text-text-secondary">
                          {formatCurrency(p.base_price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

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

              <div className="flex items-center justify-between pt-1">
                <p className="font-body text-sm font-medium text-text-primary">Jumlah</p>
                <QuantityStepper value={quantity} onChange={setQuantity} />
              </div>

              <p className="font-heading text-h3 font-semibold text-primary">
                {formatCurrency(total)}
              </p>

              <div
                className="flex items-center justify-between rounded-sm bg-border/30 px-3 py-2.5 font-body text-sm"
                title="Perkiraan kontribusi untuk kreator dari harga produk — angka final ditentukan saat checkout"
              >
                <span className="text-text-secondary">Kontribusi untuk Kreator</span>
                <span className="font-medium text-text-primary">
                  {formatCurrency(royalty)} ({Math.round(CREATOR_ROYALTY_RATE * 100)}%)
                </span>
              </div>

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
            </>
          )}
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
              {t.key === "ulasan" && design.review_count ? `${t.label} (${design.review_count})` : t.label}
              {tab === t.key && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        <div className="font-body text-sm text-text-secondary">
          {tab === "deskripsi" && (
            <div className="flex flex-col gap-4">
              <p>{design.description}</p>
              {!!design.tags?.length && (
                <div className="flex flex-wrap gap-2">
                  {design.tags.map((t) => (
                    <Tag key={t.slug}>{t.name}</Tag>
                  ))}
                </div>
              )}
            </div>
          )}
          {tab === "produk" &&
            (selectedProduct ? (
              <div className="flex flex-col gap-2">
                <p className="font-medium text-text-primary">{selectedProduct.name}</p>
                <p>{selectedProduct.description}</p>
                {selectedVariant && (
                  <ul className="mt-1 flex flex-col gap-1">
                    <li>Bahan: {selectedVariant.material}</li>
                    <li>Jenis potongan: {selectedVariant.cut_type}</li>
                    {!!selectedVariant.print_areas?.length && (
                      <li>
                        Area cetak:{" "}
                        {selectedVariant.print_areas.map((a) => PRINT_AREA_LABELS[a]).join(", ")}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            ) : (
              <p>Belum ada produk untuk desain ini.</p>
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
                Rating {design.rating_average} dari {design.review_count} ulasan pembeli. Daftar
                ulasan lengkap akan tampil di sini setelah fitur listing ulasan tersedia.
              </p>
            ) : (
              <p>Belum ada ulasan untuk desain ini.</p>
            ))}
        </div>
      </div>

      <YouMightLike categorySlug={design.category?.slug} excludeId={design.id} />

      {design.creator.slug && (
        <CreatorSummaryCard
          creatorSlug={design.creator.slug}
          creatorName={design.creator.name}
          excludeId={design.id}
        />
      )}
    </div>
  );
}

function YouMightLike({ categorySlug, excludeId }: { categorySlug?: string; excludeId: number }) {
  const { data, isLoading } = useSWR(["/marketplace/designs", "you-might-like", categorySlug], () =>
    getDesigns(categorySlug ? { categories: [categorySlug], per_page: 8 } : { sort: "terlaris", per_page: 8 }),
  );
  const items = (data?.data ?? []).filter((d: Design) => d.id !== excludeId).slice(0, 6);

  if (!isLoading && items.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
          Kamu Mungkin Suka
        </h2>
        <Link
          href={categorySlug ? `/lapak-desain?kategori=${categorySlug}` : "/lapak-desain"}
          className="shrink-0 font-body text-sm font-medium text-primary transition-colors hover:text-accent hover:underline hover:underline-offset-4"
        >
          Lihat Semua →
        </Link>
      </div>
      <div className="flex flex-wrap gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <DesignCardSkeleton key={i} />)
          : items.map((d: Design) => <DesignCard key={d.id} design={d} />)}
      </div>
    </div>
  );
}

function CreatorSummaryCard({
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
  const profile = data?.data;
  const designs = profile?.designs ?? [];
  const totalSold = designs.reduce((sum: number, d: Design) => sum + (d.sold_count ?? 0), 0);
  const ratings = designs
    .map((d: Design) => d.rating_average)
    .filter((r): r is number => r != null);
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
  const others = designs.filter((d: Design) => d.id !== excludeId).slice(0, 6);

  if (isLoading) {
    return (
      <div className="flex animate-pulse flex-col gap-4 rounded-md border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-full bg-border" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 rounded-sm bg-border" />
            <div className="h-3 w-20 rounded-sm bg-border" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6 rounded-md border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-border text-text-secondary">
            <UserRound className="size-6" />
          </span>
          <div className="flex flex-col">
            <p className="font-heading text-body font-semibold text-text-primary">{creatorName}</p>
            <Link
              href={`/kreator/${creatorSlug}`}
              className="font-body text-sm text-primary transition-colors hover:underline"
            >
              Lihat Profil
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col items-center gap-1">
            <LayoutGrid className="size-4 text-text-secondary" />
            <p className="font-heading text-lg font-semibold text-text-primary">{designs.length}</p>
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
            <Package className="size-4 text-text-secondary" />
            <p className="font-heading text-lg font-semibold text-text-primary">{totalSold}</p>
            <p className="font-body text-xs text-text-secondary">Total Terjual</p>
          </div>
        </div>
      </div>

      {others.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <p className="font-heading text-sm font-semibold text-text-primary">Koleksi Lainnya</p>
            <Link
              href={`/kreator/${creatorSlug}`}
              className="font-body text-sm font-medium text-primary transition-colors hover:text-accent hover:underline hover:underline-offset-4"
            >
              Lihat Semua →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {others.map((d: Design) => {
              const thumb = storageUrl(d.thumbnail_path);
              return (
                <Link
                  key={d.id}
                  href={`/lapak-desain/${d.slug}`}
                  className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-border transition-opacity hover:opacity-80"
                >
                  {thumb && <Image src={thumb} alt={d.title} fill sizes="64px" className="object-cover" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
