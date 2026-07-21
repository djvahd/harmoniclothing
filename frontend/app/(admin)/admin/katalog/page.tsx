"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Plus } from "lucide-react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { getProducts } from "@/services/catalog";
import { createProduct } from "@/services/admin";
import { formatCurrency } from "@/lib/format";
import { ApiError } from "@/lib/api";

export default function KelolaKatalogPage() {
  const { data, isLoading } = useSWR("/catalog/products?admin", () => getProducts({ per_page: 100 }));
  const products = data?.data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name_id: "", name_en: "", base_price: "" });
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
      });
      await mutate("/catalog/products?admin");
      setForm({ name_id: "", name_en: "", base_price: "" });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Terjadi kesalahan, coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-h3 font-semibold text-text-primary">
            Kelola Product Catalog
          </h1>
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="size-4" /> Tambah Produk
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input label="Nama (ID)" value={form.name_id} onChange={(e) => setForm((f) => ({ ...f, name_id: e.target.value }))} required />
              <Input label="Nama (EN)" value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} required />
              <Input label="Harga Dasar" type="number" value={form.base_price} onChange={(e) => setForm((f) => ({ ...f, base_price: e.target.value }))} required />
            </div>
            {error && <p className="font-body text-xs text-red-500">{error}</p>}
            <Button type="submit" loading={saving}>
              Simpan Produk
            </Button>
          </form>
        )}

        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full text-left font-body text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="p-4">Nama</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Harga Dasar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="p-4 text-text-secondary" colSpan={3}>Memuat...</td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium text-text-primary">{product.name}</td>
                  <td className="p-4 text-text-secondary">{product.category?.name ?? "-"}</td>
                  <td className="p-4 text-text-secondary">{formatCurrency(product.base_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarPageShell>
  );
}
