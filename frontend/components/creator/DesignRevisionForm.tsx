"use client";

import { useState } from "react";
import { mutate } from "swr";
import { useTranslations } from "next-intl";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import TagInput from "@/components/ui/TagInput";
import DesignFileDropzone from "@/components/creator/DesignFileDropzone";
import { updateDesign } from "@/services/creator";
import { getErrorMessage } from "@/lib/api";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "@/store/toast-store";
import type { Design } from "@/types/product";

/** BR-028: revise a rejected design in place (PATCH). Saving resets the apparel previews, so they must be confirmed again. */
export default function DesignRevisionForm({ design }: { design: Design }) {
  const t = useTranslations("creator.uploadDesign");
  const tPreview = useTranslations("creator.designPreview");
  const tCommon = useTranslations("common");
  const { data: productsData } = useProducts("all", { per_page: 100 });
  const products = productsData?.data ?? [];

  const [title, setTitle] = useState(design.title);
  const [description, setDescription] = useState(design.description ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>(
    (design.apparel ?? []).map((a) => a.product_id),
  );
  const [tags, setTags] = useState<string[]>((design.tags ?? []).map((tag) => tag.name));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleProduct(id: number) {
    setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      setError(t("noApparelError"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateDesign(design.id, {
        title,
        description: description || undefined,
        category_id: design.category?.id,
        file,
        product_ids: selectedProducts,
        tags,
      });
      await mutate("/creator/designs");
      setFile(null);
      toast(tPreview("reviseSuccess"), "success");
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4 rounded-md border border-border bg-surface p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold text-text-primary">{tPreview("reviseTitle")}</h2>
        <p className="font-body text-xs text-text-secondary">{tPreview("reviseHint")}</p>
      </div>
      <Input label={t("fields.title")} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} required />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="revise-description" className="font-body text-xs font-medium text-text-secondary">
          {t("fields.description")}
        </label>
        <textarea
          id="revise-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none"
        />
      </div>

      <DesignFileDropzone file={file} onChange={setFile} hint={tPreview("keepFileHint")} />

      <div className="flex flex-col gap-2">
        <p className="font-body text-sm font-medium text-text-primary">{t("chooseApparel")}</p>
        <div className="flex flex-wrap gap-2">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              aria-pressed={selectedProducts.includes(product.id)}
              onClick={() => toggleProduct(product.id)}
              className={
                selectedProducts.includes(product.id)
                  ? "rounded-full border border-accent bg-accent/10 px-3 py-1.5 font-body text-xs font-medium text-accent"
                  : "rounded-full border border-border px-3 py-1.5 font-body text-xs font-medium text-text-secondary"
              }
            >
              {product.name}
            </button>
          ))}
        </div>
      </div>

      <TagInput value={tags} onChange={setTags} />

      {error && <p className="font-body text-xs text-danger">{error}</p>}
      <Button type="submit" loading={loading}>
        {tPreview("saveRevision")}
      </Button>
    </form>
  );
}
