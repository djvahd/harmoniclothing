"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Star, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import QuantityStepper from "@/components/ui/QuantityStepper";
import WishlistButton from "@/components/ui/WishlistButton";
import ProductCard, { ProductCardSkeleton } from "@/components/ui/ProductCard";
import ProductGallery from "@/components/product/ProductGallery";
import VariantPicker from "@/components/product/VariantPicker";
import TrustBadges from "@/components/product/TrustBadges";
import RelatedGrid from "@/components/product/RelatedGrid";
import DetailPageSkeleton from "@/components/product/DetailPageSkeleton";
import DetailNotFound from "@/components/product/DetailNotFound";
import ProductTabs, {
  CareTabContent,
  ShippingTabContent,
  ReviewsTabContent,
} from "@/components/product/ProductTabs";
import { uploadDesignFile } from "@/services/customization";
import { addToCart } from "@/services/cart";
import { invalidateCart } from "@/hooks/useCart";
import { useProduct, useProductReviews, useProducts } from "@/hooks/useProducts";
import { storageUrl } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";
import { toast } from "@/store/toast-store";
import type { Product, PrintArea } from "@/types/product";

const TABS = [
  { key: "deskripsi", tKey: "description" },
  { key: "spesifikasi", tKey: "specs" },
  { key: "perawatan", tKey: "care" },
  { key: "pengiriman", tKey: "shipping" },
  { key: "ulasan", tKey: "reviews" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function DetailProdukPage() {
  const t = useTranslations("public.productDetail");
  const tCommon = useTranslations("common");
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { product, isLoading } = useProduct(params.slug);
  const [reviewPage, setReviewPage] = useState(1);
  const { reviews, meta: reviewsMeta, isLoading: reviewsLoading } = useProductReviews(params.slug, reviewPage);

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
      setError(getErrorMessage(err, t("uploadError")));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(destination: "cart" | "buy") {
    if (!selectedVariant) {
      setError(t("selectVariantError"));
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
      await invalidateCart();
      if (destination === "cart") toast(t("addToCartSuccess"), "success");
      router.push(destination === "cart" ? "/cart" : "/checkout");
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setPendingAction(null);
    }
  }

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (!product) {
    return (
      <DetailNotFound
        message={t("notFoundMessage")}
        backHref="/catalog"
        backLabel={t("notFoundBackLabel")}
      />
    );
  }

  const hasRating = !!product.review_count && product.review_count > 0 && product.rating_average != null;
  const hasSold = !!product.sold_count && product.sold_count > 0;
  const isLaris = hasSold && (product.sold_count ?? 0) >= 20;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-10 md:px-20">
      <nav className="flex flex-wrap items-center gap-1.5 font-body text-sm text-text-secondary">
        <Link href="/catalog" className="transition-colors hover:text-primary">
          {t("breadcrumbCatalog")}
        </Link>
        {product.category && (
          <>
            <ChevronRight className="size-3.5" />
            <Link
              href={`/catalog?kategori=${product.category.slug}`}
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
        <ProductGallery
          previewImage={previewImage}
          alt={product.name}
          isLaris={isLaris}
          wishlist={<WishlistButton productId={product.id} className="absolute right-3 top-3" />}
          items={galleryItems}
          activeKey={activeGalleryItem?.key}
          onSelectItem={(key) => {
            setGalleryKey(key);
            setColor(key);
          }}
        />

        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h1 className="font-heading text-h3 font-semibold text-text-primary md:text-h2">
              {product.name}
            </h1>
            {(hasRating || hasSold) && (
              <div className="mt-1 flex flex-wrap items-center gap-1.5 font-body text-sm text-text-secondary">
                {hasRating && (
                  <span className="flex items-center gap-1">
                    <Star className="size-3.5 fill-warning text-warning" />
                    {t("ratingSummary", { rating: product.rating_average ?? 0, count: product.review_count ?? 0 })}
                  </span>
                )}
                {hasRating && hasSold && <span>·</span>}
                {hasSold && <span>{t("soldCount", { count: product.sold_count ?? 0 })}</span>}
              </div>
            )}
          </div>

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

          <div className="flex flex-col gap-2">
            <p className="font-body text-sm font-medium text-text-primary">{t("uploadLabel")}</p>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-sm border border-dashed border-border py-5 text-center transition-colors hover:border-primary/50">
              <Upload className="size-5 text-text-secondary" />
              <span className="font-body text-xs text-text-secondary">
                {uploading
                  ? t("uploadStatusUploading")
                  : uploadedPath
                    ? t("uploadStatusUploaded")
                    : t("uploadStatusIdle")}
              </span>
              <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleUpload} />
            </label>
            <Link
              href="/marketplace"
              className="font-body text-sm font-medium text-primary transition-colors hover:underline"
            >
              {t("marketplaceLink")}
            </Link>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="font-body text-sm font-medium text-text-primary">{t("quantityLabel")}</p>
            <QuantityStepper value={quantity} onChange={setQuantity} />
          </div>

          <p className="font-heading text-h3 font-semibold text-primary">{formatCurrency(total)}</p>

          <div className="flex flex-col gap-2">
            <p className="font-body text-sm font-medium text-text-primary">{t("notesLabel")}</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none"
              placeholder={t("notesPlaceholder")}
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
              {t("addToCart")}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              loading={pendingAction === "buy"}
              disabled={pendingAction !== null}
              onClick={() => handleSubmit("buy")}
            >
              {t("buyNow")}
            </Button>
          </div>

          <Link
            href={`/bulk-order/${product.slug}`}
            className="font-body text-sm font-medium text-primary transition-colors hover:underline"
          >
            {t("bulkOrderLink")}
          </Link>

          <TrustBadges />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <ProductTabs
          tabs={TABS.map((tabDef) => ({
            key: tabDef.key,
            label: t(`tabs.${tabDef.tKey}`),
            badge: tabDef.key === "ulasan" ? product.review_count ?? undefined : undefined,
          }))}
          active={tab}
          onChange={(key) => setTab(key as TabKey)}
        />

        <div className="font-body text-sm text-text-secondary">
          {tab === "deskripsi" && <p>{product.description}</p>}
          {tab === "spesifikasi" &&
            (selectedVariant ? (
              <ul className="flex flex-col gap-1">
                <li>{t("specsMaterial", { material: selectedVariant.material })}</li>
                <li>{t("specsCutType", { cutType: selectedVariant.cut_type })}</li>
                {!!selectedVariant.print_areas?.length && (
                  <li>
                    {t("specsPrintAreas", {
                      areas: selectedVariant.print_areas.map((a) => t(`printAreas.${a}`)).join(", "),
                    })}
                  </li>
                )}
              </ul>
            ) : (
              <p>{t("specsSelectVariantPrompt")}</p>
            ))}
          {tab === "perawatan" && <CareTabContent />}
          {tab === "pengiriman" && <ShippingTabContent />}
          {tab === "ulasan" && (
            <ReviewsTabContent
              hasRating={hasRating}
              ratingAverage={product.rating_average}
              reviewCount={product.review_count}
              emptyMessage={t("reviewsEmptyMessage")}
              reviews={reviews}
              reviewsLoading={reviewsLoading}
              meta={reviewsMeta}
              onPageChange={setReviewPage}
            />
          )}
        </div>
      </div>

      <YouMightLike categorySlug={product.category?.slug} excludeId={product.id} />
    </div>
  );
}

function YouMightLike({ categorySlug, excludeId }: { categorySlug?: string; excludeId: number }) {
  const { data, isLoading } = useProducts(
    "you-might-like",
    categorySlug ? { categories: [categorySlug], per_page: 8 } : { sort: "terlaris", per_page: 8 },
  );
  const items = (data?.data ?? []).filter((p: Product) => p.id !== excludeId).slice(0, 6);

  return (
    <RelatedGrid
      seeAllHref={categorySlug ? `/catalog?kategori=${categorySlug}` : "/catalog"}
      isLoading={isLoading}
      items={items}
      renderItem={(p: Product) => <ProductCard key={p.id} product={p} />}
      renderSkeleton={(i) => <ProductCardSkeleton key={i} />}
    />
  );
}
