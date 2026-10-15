"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import Tag from "@/components/ui/Tag";
import QuantityStepper from "@/components/ui/QuantityStepper";
import PriceSummaryRow from "@/components/ui/PriceSummaryRow";
import Button from "@/components/ui/Button";
import { uploadDesignFile } from "@/services/customization";
import { addToCart } from "@/services/cart";
import { invalidateCart } from "@/hooks/useCart";
import { useProduct } from "@/hooks/useProducts";
import { useDesign } from "@/hooks/useDesigns";
import { storageUrl } from "@/lib/storage";
import { getErrorMessage, isNotFoundError } from "@/lib/api";
import InlineError from "@/components/ui/InlineError";
import DetailNotFound from "@/components/product/DetailNotFound";
import { isValidDesignFile } from "@/lib/design-file";
import { swatchColor } from "@/lib/colors";
import LoadingState from "@/components/ui/LoadingState";
import { toast } from "@/store/toast-store";

function ProductEditorForm() {
  const t = useTranslations("customer.customize");
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const designSlug = searchParams.get("design");

  const { product, isLoading, error: loadError } = useProduct(params.slug);
  const { design } = useDesign(designSlug);

  const colors = useMemo(
    () => Array.from(new Set(product?.variants?.map((v) => v.color) ?? [])),
    [product],
  );
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState("");
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
    if (!isValidDesignFile(file)) {
      setError(t("uploadInvalid"));
      e.target.value = "";
      return;
    }
    setError(null);
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

  async function handleAddToCart() {
    if (!selectedVariant) {
      setError(t("selectVariantError"));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await addToCart({
        product_variant_id: selectedVariant.id,
        design_id: design?.id,
        quantity,
        notes: notes || undefined,
        custom_design_file_path: uploadedPath ?? undefined,
      });
      await invalidateCart();
      toast(t("addToCartSuccess"), "success");
      router.push("/cart");
    } catch (err) {
      setError(getErrorMessage(err, t("submitError")));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError && !isNotFoundError(loadError)) {
    return <InlineError />;
  }

  if (!product) {
    // Still loading: skeleton. Finished without a product (unknown slug): a clear message, not a skeleton forever.
    return isLoading ? (
      <LoadingState variant="detail" />
    ) : (
      <DetailNotFound message={t("productNotFound")} backHref="/catalog" backLabel={t("backToCatalog")} />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-8 md:flex-row md:px-20">
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex gap-4 font-body text-sm font-medium text-text-secondary">
          <span>{t("viewFront")}</span>
          <span>{t("viewBack")}</span>
          <span>{t("viewSide")}</span>
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
        <p className="font-body text-xs text-text-secondary">{t("previewNote")}</p>
      </div>

      <div className="flex w-full flex-col gap-6 md:w-[480px]">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          {t("title")} {product.name}
        </h1>

        <div className="flex flex-col gap-2">
          <p className="font-body text-sm font-medium text-text-primary">{t("chooseColor")}</p>
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
                style={{ backgroundColor: swatchColor(c) }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-body text-sm font-medium text-text-primary">{t("chooseSize")}</p>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((s) => (
              <button key={s} onClick={() => setSize(s)}>
                <Tag active={size === s}>{s}</Tag>
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
              <p className="font-body text-xs text-text-secondary">
                {t("byCreator", { name: design.creator.name })}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="font-body text-sm font-medium text-text-primary">{t("uploadLabel")}</p>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-sm border border-dashed border-border py-6 text-center">
              <Upload className="size-5 text-text-secondary" />
              <span className="font-body text-xs text-text-secondary">
                {uploading
                  ? t("uploadStatusUploading")
                  : uploadedPath
                    ? t("uploadStatusUploaded")
                    : t("uploadStatusIdle")}
              </span>
              <input type="file" accept="image/png,image/svg+xml" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="font-body text-sm font-medium text-text-primary">{t("quantityLabel")}</p>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-body text-sm font-medium text-text-primary">{t("notesLabel")}</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none"
            placeholder={t("notesPlaceholder")}
          />
        </div>

        <div className="border-t border-border pt-4">
          <PriceSummaryRow label={t("productPrice")} amount={unitPrice} />
          <PriceSummaryRow label={t("total")} amount={total} emphasis />
        </div>

        {error && <p className="font-body text-xs text-danger">{error}</p>}
        <Button fullWidth loading={submitting} onClick={handleAddToCart}>
          {t("addToCart")}
        </Button>
      </div>
    </div>
  );
}

export default function ProductEditorPage() {
  return <ProductEditorForm />;
}
