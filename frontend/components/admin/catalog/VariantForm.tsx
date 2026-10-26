"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PrintAreaCheckboxes from "./PrintAreaCheckboxes";
import { createVariant, uploadVariantMockup } from "@/services/admin";
import { getErrorMessage } from "@/lib/api";
import type { PrintArea } from "@/types/product";

const EMPTY_VARIANT_FORM = {
  color: "",
  size: "",
  cut_type: "",
  material: "",
  price_modifier: "0",
  mockup_asset_path: "",
  print_areas: [] as PrintArea[],
};

/** The "Tambah Varian Baru" form shown under a product's expanded variant table. */
export default function VariantForm({
  productId,
  onCreated,
}: {
  productId: number;
  onCreated: () => void;
}) {
  const t = useTranslations("admin.catalog.variantForm");
  const tCommon = useTranslations("common");
  const [form, setForm] = useState(EMPTY_VARIANT_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mockupFileName, setMockupFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleMockupUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { data } = await uploadVariantMockup(file);
      setForm((f) => ({ ...f, mockup_asset_path: data.path }));
      setMockupFileName(file.name);
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createVariant(productId, {
        color: form.color,
        size: form.size,
        cut_type: form.cut_type,
        material: form.material,
        price_modifier: Number(form.price_modifier),
        mockup_asset_path: form.mockup_asset_path,
        print_areas: form.print_areas,
      });
      onCreated();
      setForm(EMPTY_VARIANT_FORM);
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-border p-4">
      <p className="font-body text-xs font-medium text-text-secondary">{t("title")}</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input label={t("color")} value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} required />
        <Input label={t("size")} value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} required />
        <Input label={t("cutType")} value={form.cut_type} onChange={(e) => setForm((f) => ({ ...f, cut_type: e.target.value }))} required />
        <Input label={t("material")} value={form.material} onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))} required />
        <Input
          label={t("priceAddon")}
          type="number"
          value={form.price_modifier}
          onChange={(e) => setForm((f) => ({ ...f, price_modifier: e.target.value }))}
        />
        <div className="flex flex-col gap-1.5">
          <span className="font-body text-xs font-medium text-text-secondary">{t("mockupAssetPath")} *</span>
          <label className="flex cursor-pointer items-center gap-2 rounded-sm border border-dashed border-border px-3 py-2.5 text-center focus-within:border-primary">
            <Upload className="size-4 shrink-0 text-text-secondary" />
            <span className="truncate font-body text-xs text-text-secondary">
              {uploading ? t("mockupUploading") : mockupFileName ?? t("mockupDropzone")}
            </span>
            <input
              type="file"
              accept="image/png,image/svg+xml"
              className="sr-only"
              onChange={(e) => handleMockupUpload(e.target.files?.[0])}
            />
          </label>
          {!form.mockup_asset_path && <p className="font-body text-xs text-text-secondary">{t("mockupRequired")}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs font-medium text-text-secondary">{t("printArea")}</label>
        <PrintAreaCheckboxes
          value={form.print_areas}
          onChange={(print_areas) => setForm((f) => ({ ...f, print_areas }))}
        />
      </div>
      {error && <p className="font-body text-xs text-danger">{error}</p>}
      <Button type="submit" loading={saving} disabled={uploading || !form.mockup_asset_path} className="w-fit">
        {t("save")}
      </Button>
    </form>
  );
}
