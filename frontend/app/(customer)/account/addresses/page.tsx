"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Plus } from "lucide-react";
import AccountSidebar from "@/components/layout/AccountSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createAddress, deleteAddress, getAddresses } from "@/services/account";
import type { Address } from "@/types/user";

const EMPTY_FORM = {
  label: "",
  recipient_name: "",
  phone: "",
  province: "",
  city: "",
  district: "",
  postal_code: "",
  address_line: "",
  is_default: false,
};

export default function AddressBookPage() {
  const { data, isLoading } = useSWR("/account/addresses", getAddresses);
  const addresses = data?.data ?? [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Address, "id">>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createAddress(form);
      await mutate("/account/addresses");
      setForm(EMPTY_FORM);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteAddress(id);
    mutate("/account/addresses");
  }

  return (
    <SidebarPageShell sidebar={<AccountSidebar />}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-h3 font-semibold text-text-primary">Address Book</h1>
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="size-4" /> Tambah Alamat
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input label="Label (mis. Rumah)" value={form.label} onChange={(e) => update("label", e.target.value)} required />
              <Input label="Nama Penerima" value={form.recipient_name} onChange={(e) => update("recipient_name", e.target.value)} required />
              <Input label="No. Telepon" value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
              <Input label="Provinsi" value={form.province} onChange={(e) => update("province", e.target.value)} required />
              <Input label="Kota/Kabupaten" value={form.city} onChange={(e) => update("city", e.target.value)} required />
              <Input label="Kecamatan" value={form.district} onChange={(e) => update("district", e.target.value)} required />
              <Input label="Kode Pos" value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} required />
            </div>
            <Input label="Alamat Lengkap" value={form.address_line} onChange={(e) => update("address_line", e.target.value)} required />
            <label className="flex items-center gap-2 font-body text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => update("is_default", e.target.checked)}
              />
              Jadikan alamat utama
            </label>
            <Button type="submit" loading={saving}>
              Simpan Alamat
            </Button>
          </form>
        )}

        {isLoading && <p className="font-body text-sm text-text-secondary">Memuat alamat...</p>}
        <div className="flex flex-col gap-3">
          {addresses.map((address) => (
            <div key={address.id} className="flex items-center justify-between rounded-md border border-border bg-surface p-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="font-body text-sm font-semibold text-text-primary">{address.label}</p>
                  {address.is_default && <Badge variant="success">Utama</Badge>}
                </div>
                <p className="font-body text-sm text-text-secondary">
                  {address.recipient_name} · {address.phone}
                </p>
                <p className="font-body text-xs text-text-secondary">
                  {address.address_line}, {address.district}, {address.city}, {address.province}{" "}
                  {address.postal_code}
                </p>
              </div>
              <button
                onClick={() => handleDelete(address.id)}
                className="font-body text-sm font-medium text-red-500"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      </div>
    </SidebarPageShell>
  );
}
