"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PrintAreaCheckboxes from "./PrintAreaCheckboxes";
import { createVariant } from "@/services/admin";
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
  const [form, setForm] = useState(EMPTY_VARIANT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(getErrorMessage(err, "Terjadi kesalahan, coba lagi."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-border p-4">
      <p className="font-body text-xs font-medium text-text-secondary">Tambah Varian Baru</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input label="Warna" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} required />
        <Input label="Ukuran" value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} required />
        <Input label="Potongan" value={form.cut_type} onChange={(e) => setForm((f) => ({ ...f, cut_type: e.target.value }))} required />
        <Input label="Material" value={form.material} onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))} required />
        <Input
          label="Tambahan Harga"
          type="number"
          value={form.price_modifier}
          onChange={(e) => setForm((f) => ({ ...f, price_modifier: e.target.value }))}
        />
        <Input
          label="Path Aset Mockup"
          value={form.mockup_asset_path}
          onChange={(e) => setForm((f) => ({ ...f, mockup_asset_path: e.target.value }))}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs font-medium text-text-secondary">Print Area</label>
        <PrintAreaCheckboxes
          value={form.print_areas}
          onChange={(print_areas) => setForm((f) => ({ ...f, print_areas }))}
        />
      </div>
      {error && <p className="font-body text-xs text-danger">{error}</p>}
      <Button type="submit" loading={saving} className="w-fit">
        Simpan Varian
      </Button>
    </form>
  );
}
