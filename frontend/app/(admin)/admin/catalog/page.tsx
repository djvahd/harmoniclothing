"use client";

import { Fragment, useState } from "react";
import useSWR, { mutate } from "swr";
import { ChevronDown, ChevronRight, PackageSearch, Pencil, Plus } from "lucide-react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { TableRowsSkeleton } from "@/components/ui/LoadingState";
import { getProducts } from "@/services/catalog";
import { createProduct, createVariant, updateVariant } from "@/services/admin";
import { formatCurrency } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";
import type { PrintArea, ProductVariant } from "@/types/product";

const PRINT_AREA_OPTIONS: PrintArea[] = ["depan", "belakang", "lengan"];
const PRINT_AREA_LABELS: Record<PrintArea, string> = { depan: "Depan", belakang: "Belakang", lengan: "Lengan" };

const EMPTY_VARIANT_FORM = {
  color: "",
  size: "",
  cut_type: "",
  material: "",
  price_modifier: "0",
  mockup_asset_path: "",
  print_areas: [] as PrintArea[],
};

function togglePrintArea(list: PrintArea[], area: PrintArea): PrintArea[] {
  return list.includes(area) ? list.filter((a) => a !== area) : [...list, area];
}

function PrintAreaCheckboxes({
  value,
  onChange,
}: {
  value: PrintArea[];
  onChange: (value: PrintArea[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {PRINT_AREA_OPTIONS.map((area) => (
        <label key={area} className="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            checked={value.includes(area)}
            onChange={() => onChange(togglePrintArea(value, area))}
            className="size-4 rounded border-border accent-primary"
          />
          <span className="font-body text-sm text-text-secondary">{PRINT_AREA_LABELS[area]}</span>
        </label>
      ))}
    </div>
  );
}

function VariantRow({ variant }: { variant: ProductVariant }) {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    price_modifier: String(variant.price_modifier),
    print_areas: variant.print_areas ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateVariant(variant.id, {
        color: variant.color,
        size: variant.size,
        cut_type: variant.cut_type,
        material: variant.material,
        mockup_asset_path: variant.mockup_asset_path ?? "",
        price_modifier: Number(editForm.price_modifier),
        print_areas: editForm.print_areas,
      });
      await mutate("/catalog/products?admin");
      setEditing(false);
    } catch (err) {
      setError(getErrorMessage(err, "Terjadi kesalahan, coba lagi."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="p-3 text-text-secondary">{variant.color}</td>
      <td className="p-3 text-text-secondary">{variant.size}</td>
      <td className="p-3 text-text-secondary">{variant.cut_type}</td>
      <td className="p-3 text-text-secondary">{variant.material}</td>
      <td className="p-3">
        {editing ? (
          <PrintAreaCheckboxes
            value={editForm.print_areas}
            onChange={(print_areas) => setEditForm((f) => ({ ...f, print_areas }))}
          />
        ) : (
          <span className="text-text-secondary">
            {variant.print_areas?.map((a) => PRINT_AREA_LABELS[a]).join(", ") || "-"}
          </span>
        )}
      </td>
      <td className="p-3">
        {editing ? (
          <input
            type="number"
            value={editForm.price_modifier}
            onChange={(e) => setEditForm((f) => ({ ...f, price_modifier: e.target.value }))}
            className="w-24 rounded-sm border border-border bg-surface px-2 py-1 font-body text-sm text-text-primary outline-none"
          />
        ) : (
          <span className="text-text-secondary">{formatCurrency(variant.price_modifier)}</span>
        )}
      </td>
      <td className="p-3">
        {editing ? (
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} loading={saving}>
              Simpan
            </Button>
            <button
              onClick={() => setEditing(false)}
              className="font-body text-xs text-text-secondary underline"
            >
              Batal
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-text-secondary hover:text-primary">
            <Pencil className="size-4" />
          </button>
        )}
        {error && <p className="mt-1 font-body text-xs text-danger">{error}</p>}
      </td>
    </tr>
  );
}

export default function KelolaKatalogPage() {
  const { data, isLoading } = useSWR("/catalog/products?admin", () => getProducts({ per_page: 100 }));
  const products = data?.data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name_id: "", name_en: "", base_price: "", gender_segment: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [variantForm, setVariantForm] = useState(EMPTY_VARIANT_FORM);
  const [variantSaving, setVariantSaving] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);

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
      await mutate("/catalog/products?admin");
      setForm({ name_id: "", name_en: "", base_price: "", gender_segment: "" });
      setShowForm(false);
    } catch (err) {
      setError(getErrorMessage(err, "Terjadi kesalahan, coba lagi."));
    } finally {
      setSaving(false);
    }
  }

  function toggleExpand(productId: number) {
    setExpandedProductId((current) => (current === productId ? null : productId));
    setVariantForm(EMPTY_VARIANT_FORM);
    setVariantError(null);
  }

  async function handleAddVariant(e: React.FormEvent, productId: number) {
    e.preventDefault();
    setVariantSaving(true);
    setVariantError(null);
    try {
      await createVariant(productId, {
        color: variantForm.color,
        size: variantForm.size,
        cut_type: variantForm.cut_type,
        material: variantForm.material,
        price_modifier: Number(variantForm.price_modifier),
        mockup_asset_path: variantForm.mockup_asset_path,
        print_areas: variantForm.print_areas,
      });
      await mutate("/catalog/products?admin");
      setVariantForm(EMPTY_VARIANT_FORM);
    } catch (err) {
      setVariantError(getErrorMessage(err, "Terjadi kesalahan, coba lagi."));
    } finally {
      setVariantSaving(false);
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
        )}

        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full text-left font-body text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="w-8 p-4" />
                <th className="p-4">Nama</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Harga Dasar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <TableRowsSkeleton columns={4} />}
              {!isLoading && products.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-0">
                    <EmptyState icon={PackageSearch} title="Belum ada produk." />
                  </td>
                </tr>
              )}
              {products.map((product) => (
                <Fragment key={product.id}>
                  <tr
                    onClick={() => toggleExpand(product.id)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-border/20"
                  >
                    <td className="p-4 text-text-secondary">
                      {expandedProductId === product.id ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </td>
                    <td className="p-4 font-medium text-text-primary">{product.name}</td>
                    <td className="p-4 text-text-secondary">{product.category?.name ?? "-"}</td>
                    <td className="p-4 text-text-secondary">{formatCurrency(product.base_price)}</td>
                  </tr>
                  {expandedProductId === product.id && (
                    <tr key={`${product.id}-variants`} className="border-b border-border bg-surface last:border-0">
                      <td colSpan={4} className="p-4">
                        <div className="flex flex-col gap-4">
                          <h3 className="font-heading text-sm font-semibold text-text-primary">Varian Produk</h3>

                          {!!product.variants?.length && (
                            <div className="overflow-x-auto rounded-md border border-border">
                              <table className="w-full text-left font-body text-sm">
                                <thead className="border-b border-border text-text-secondary">
                                  <tr>
                                    <th className="p-3">Warna</th>
                                    <th className="p-3">Ukuran</th>
                                    <th className="p-3">Potongan</th>
                                    <th className="p-3">Material</th>
                                    <th className="p-3">Print Area</th>
                                    <th className="p-3">Tambahan Harga</th>
                                    <th className="p-3">Aksi</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {product.variants.map((variant) => (
                                    <VariantRow key={variant.id} variant={variant} />
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          <form
                            onSubmit={(e) => handleAddVariant(e, product.id)}
                            className="flex flex-col gap-3 rounded-md border border-border p-4"
                          >
                            <p className="font-body text-xs font-medium text-text-secondary">Tambah Varian Baru</p>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                              <Input
                                label="Warna"
                                value={variantForm.color}
                                onChange={(e) => setVariantForm((f) => ({ ...f, color: e.target.value }))}
                                required
                              />
                              <Input
                                label="Ukuran"
                                value={variantForm.size}
                                onChange={(e) => setVariantForm((f) => ({ ...f, size: e.target.value }))}
                                required
                              />
                              <Input
                                label="Potongan"
                                value={variantForm.cut_type}
                                onChange={(e) => setVariantForm((f) => ({ ...f, cut_type: e.target.value }))}
                                required
                              />
                              <Input
                                label="Material"
                                value={variantForm.material}
                                onChange={(e) => setVariantForm((f) => ({ ...f, material: e.target.value }))}
                                required
                              />
                              <Input
                                label="Tambahan Harga"
                                type="number"
                                value={variantForm.price_modifier}
                                onChange={(e) => setVariantForm((f) => ({ ...f, price_modifier: e.target.value }))}
                              />
                              <Input
                                label="Path Aset Mockup"
                                value={variantForm.mockup_asset_path}
                                onChange={(e) => setVariantForm((f) => ({ ...f, mockup_asset_path: e.target.value }))}
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="font-body text-xs font-medium text-text-secondary">Print Area</label>
                              <PrintAreaCheckboxes
                                value={variantForm.print_areas}
                                onChange={(print_areas) => setVariantForm((f) => ({ ...f, print_areas }))}
                              />
                            </div>
                            {variantError && <p className="font-body text-xs text-danger">{variantError}</p>}
                            <Button type="submit" loading={variantSaving} className="w-fit">
                              Simpan Varian
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarPageShell>
  );
}
