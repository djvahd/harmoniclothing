"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { toast } from "@/store/toast-store";
import { createProduct, updateProduct, type AdminProduct } from "@/services/admin";
import { getErrorMessage } from "@/lib/api";
import type { GenderSegment } from "@/types/product";

const EMPTY_FORM = {
  name_id: "",
  name_en: "",
  base_price: "",
  gender_segment: "",
  description_id: "",
  description_en: "",
  is_active: true,
};

function formFromProduct(product?: AdminProduct) {
  if (!product) return EMPTY_FORM;
  return {
    name_id: product.name_id,
    name_en: product.name_en,
    base_price: String(product.base_price),
    gender_segment: product.gender_segment ?? "",
    description_id: product.description_id ?? "",
    description_en: product.description_en ?? "",
    is_active: product.is_active,
  };
}

/** Add-product form (no `product`) or edit-product form (`product` given) — same fields, PATCH vs POST. */
export default function ProductForm({ product, onSaved }: { product?: AdminProduct; onSaved: () => void }) {
  const t = useTranslations("admin.catalog.productForm");
  const tCommon = useTranslations("common");
  const [form, setForm] = useState(() => formFromProduct(product));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name_id: form.name_id,
      name_en: form.name_en,
      base_price: Number(form.base_price),
      gender_segment: form.gender_segment ? (form.gender_segment as GenderSegment) : undefined,
      description_id: form.description_id || undefined,
      description_en: form.description_en || undefined,
      is_active: form.is_active,
    };
    try {
      if (product) {
        await updateProduct(product.id, payload);
        toast(t("updated"), "success");
      } else {
        await createProduct(payload);
        setForm(EMPTY_FORM);
      }
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setSaving(false);
    }
  }

  const textareaClass =
    "rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none hover:border-primary focus:border-primary";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label={t("nameId")} value={form.name_id} onChange={(e) => update("name_id", e.target.value)} required />
        <Input label={t("nameEn")} value={form.name_en} onChange={(e) => update("name_en", e.target.value)} required />
        <Input label={t("basePrice")} type="number" value={form.base_price} onChange={(e) => update("base_price", e.target.value)} required />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-segment" className="font-body text-xs font-medium text-text-secondary">{t("segment")}</label>
          <select id="product-segment"
            value={form.gender_segment}
            onChange={(e) => update("gender_segment", e.target.value)}
            className="rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none"
          >
            <option value="">{t("segmentUnset")}</option>
            <option value="pria">{t("segmentMen")}</option>
            <option value="wanita">{t("segmentWomen")}</option>
            <option value="unisex">{t("segmentUnisex")}</option>
            <option value="anak">{t("segmentKids")}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-description-id" className="font-body text-xs font-medium text-text-secondary">{t("descriptionId")}</label>
          <textarea id="product-description-id" rows={3} value={form.description_id} onChange={(e) => update("description_id", e.target.value)} className={textareaClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-description-en" className="font-body text-xs font-medium text-text-secondary">{t("descriptionEn")}</label>
          <textarea id="product-description-en" rows={3} value={form.description_en} onChange={(e) => update("description_en", e.target.value)} className={textareaClass} />
        </div>
      </div>
      <label className="flex items-center gap-2 font-body text-sm text-text-secondary">
        <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} />
        {t("isActive")}
      </label>
      {error && <p className="font-body text-xs text-danger">{error}</p>}
      <Button type="submit" loading={saving}>
        {product ? t("update") : t("save")}
      </Button>
    </form>
  );
}
