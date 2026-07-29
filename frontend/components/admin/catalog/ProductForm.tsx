"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createProduct } from "@/services/admin";
import { getErrorMessage } from "@/lib/api";

/** The "Tambah Produk" form shown above the catalog table. */
export default function ProductForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ name_id: "", name_en: "", base_price: "", gender_segment: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createProduct({
        name_id: form.name_id,
        name_en: form.name_en,
        base_price: Number(form.base_price),
        gender_segment: form.gender_segment
          ? (form.gender_segment as "pria" | "wanita" | "unisex" | "anak")
          : undefined,
      });
      onCreated();
      setForm({ name_id: "", name_en: "", base_price: "", gender_segment: "" });
    } catch (err) {
      setError(getErrorMessage(err, "Terjadi kesalahan, coba lagi."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Nama (ID)" value={form.name_id} onChange={(e) => setForm((f) => ({ ...f, name_id: e.target.value }))} required />
        <Input label="Nama (EN)" value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} required />
        <Input label="Harga Dasar" type="number" value={form.base_price} onChange={(e) => setForm((f) => ({ ...f, base_price: e.target.value }))} required />
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs font-medium text-text-secondary">Segmen</label>
          <select
            value={form.gender_segment}
            onChange={(e) => setForm((f) => ({ ...f, gender_segment: e.target.value }))}
            className="rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none"
          >
            <option value="">Tidak ditentukan</option>
            <option value="pria">Men&apos;s</option>
            <option value="wanita">Women&apos;s</option>
            <option value="unisex">Unisex</option>
            <option value="anak">Kids</option>
          </select>
        </div>
      </div>
      {error && <p className="font-body text-xs text-danger">{error}</p>}
      <Button type="submit" loading={saving}>
        Simpan Produk
      </Button>
    </form>
  );
}
