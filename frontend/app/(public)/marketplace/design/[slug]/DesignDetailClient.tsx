"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import clsx from "clsx";
import { ChevronRight, LayoutGrid, Package, Star, UserRound } from "lucide-react";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import QuantityStepper from "@/components/ui/QuantityStepper";
import WishlistButton from "@/components/ui/WishlistButton";
import DesignCard, { DesignCardSkeleton } from "@/components/ui/DesignCard";
import ProductGallery from "@/components/product/ProductGallery";
import VariantPicker from "@/components/product/VariantPicker";
import TrustBadges from "@/components/product/TrustBadges";
import RelatedGrid from "@/components/product/RelatedGrid";
import DetailPageSkeleton from "@/components/product/DetailPageSkeleton";
import DetailNotFound from "@/components/product/DetailNotFound";
import ProductTabs, {
  CARE_TAB_CONTENT,
  SHIPPING_TAB_CONTENT,
  ReviewsTabContent,
} from "@/components/product/ProductTabs";
import { getCreatorBySlug } from "@/services/marketplace";
import { addToCart } from "@/services/cart";
import { invalidateCart } from "@/hooks/useCart";
import { useDesign, useDesignReviews, useDesigns } from "@/hooks/useDesigns";
import { swrKeys } from "@/lib/swr-keys";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";
import { toast } from "@/store/toast-store";
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
  const { design, isLoading } = useDesign(params.slug);
  const [reviewPage, setReviewPage] = useState(1);
  const { reviews, meta: reviewsMeta, isLoading: reviewsLoading } = useDesignReviews(params.slug, reviewPage);
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
      await invalidateCart();
      if (destination === "cart") toast("Ditambahkan ke keranjang.", "success");
      router.push(destination === "cart" ? "/cart" : "/checkout");
    } catch (err) {
      setError(getErrorMessage(err, "Terjadi kesalahan, coba lagi."));
    } finally {
      setPendingAction(null);
    }
  }

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (!design) {
    return (
      <DetailNotFound
        message="Desain tidak ditemukan."
        backHref="/marketplace"
        backLabel="Kembali ke Lapak Desain"
      />
    );
  }

  const hasRating = !!design.review_count && design.review_count > 0 && design.rating_average != null;
  const hasSold = !!design.sold_count && design.sold_count > 0;
  const isLaris = hasSold && (design.sold_count ?? 0) >= 20;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-10 md:px-20">
      <nav className="flex flex-wrap items-center gap-1.5 font-body text-sm text-text-secondary">
        <Link href="/marketplace" className="transition-colors hover:text-primary">
          Lapak Desain
        </Link>
        {design.category && (
          <>
            <ChevronRight className="size-3.5" />
            <Link
              href={`/marketplace?kategori=${design.category.slug}`}
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
        <ProductGallery
          previewImage={previewImage}
          alt={design.title}
          isLaris={isLaris}
          wishlist={<WishlistButton designId={design.id} className="absolute right-3 top-3" />}
          items={galleryItems}
          activeKey={activeGalleryItem?.key}
          onSelectItem={(key) => setGalleryKey(key)}
        />

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
                  href={`/marketplace/${design.creator.slug}`}
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
                  <Star className="size-3.5 fill-warning text-warning" />
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

              <VariantPicker
                colors={colors}
                activeColor={activeColor}
                onSelectColor={(c) => {
                  setColor(c);
                  setGalleryKey(c);
                }}
                sizes={sizesForColor}
                activeSize={activeSize}
                onSelectSize={setSize}
                showSizeChart={showSizeChart}
                onToggleSizeChart={() => setShowSizeChart((v) => !v)}
              />

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

              {error && <p className="font-body text-xs text-danger">{error}</p>}

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

              <TrustBadges />
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <ProductTabs
          tabs={TABS.map((t) => ({
            ...t,
            badge: t.key === "ulasan" ? design.review_count ?? undefined : undefined,
          }))}
          active={tab}
          onChange={(key) => setTab(key as TabKey)}
        />

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
          {tab === "perawatan" && CARE_TAB_CONTENT}
          {tab === "pengiriman" && SHIPPING_TAB_CONTENT}
          {tab === "ulasan" && (
            <ReviewsTabContent
              hasRating={hasRating}
              ratingAverage={design.rating_average}
              reviewCount={design.review_count}
              emptyMessage="Belum ada ulasan untuk desain ini."
              reviews={reviews}
              reviewsLoading={reviewsLoading}
              meta={reviewsMeta}
              onPageChange={setReviewPage}
            />
          )}
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
  const { data, isLoading } = useDesigns(
    "you-might-like",
    categorySlug ? { categories: [categorySlug], per_page: 8 } : { sort: "terlaris", per_page: 8 },
  );
  const items = (data?.data ?? []).filter((d: Design) => d.id !== excludeId).slice(0, 6);

  return (
    <RelatedGrid
      seeAllHref={categorySlug ? `/marketplace?kategori=${categorySlug}` : "/marketplace"}
      isLoading={isLoading}
      items={items}
      renderItem={(d: Design) => <DesignCard key={d.id} design={d} />}
      renderSkeleton={(i) => <DesignCardSkeleton key={i} />}
    />
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
  const { data, isLoading } = useSWR(swrKeys.creatorBySlug(creatorSlug), () =>
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
              href={`/marketplace/${creatorSlug}`}
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
              href={`/marketplace/${creatorSlug}`}
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
                  href={`/marketplace/design/${d.slug}`}
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
