"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { MapPin, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import AccountSidebar from "@/components/layout/AccountSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { toast } from "@/store/toast-store";
import { createAddress, deleteAddress, getAddresses, updateAddress } from "@/services/account";
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
  const t = useTranslations("customer.addresses");
  const tCommon = useTranslations("common");
  const { data, isLoading } = useSWR("/account/addresses", getAddresses);
  const addresses = data?.data ?? [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Address, "id">>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); // null = form menambah alamat baru

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId === null) await createAddress(form);
      else await updateAddress(editingId, form);
      await mutate("/account/addresses");
      closeForm();
      toast(t("saveSuccess"), "success");
    } finally {
      setSaving(false);
    }
  }

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm((open) => !(open && editingId === null));
  }

  function openEditForm(address: Address) {
    const { id, ...fields } = address;
    setEditingId(id);
    setForm(fields);
    setShowForm(true);
  }

  function closeForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  async function handleDelete(id: number) {
    await deleteAddress(id);
    mutate("/account/addresses");
    toast(t("deleteSuccess"), "success");
  }

  return (
    <SidebarPageShell sidebar={<AccountSidebar />}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>
          <Button onClick={openAddForm}>
            <Plus className="size-4" /> {t("addAddress")}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input label={t("fields.label")} value={form.label} onChange={(e) => update("label", e.target.value)} required />
              <Input label={t("fields.recipientName")} value={form.recipient_name} onChange={(e) => update("recipient_name", e.target.value)} required />
              <Input label={t("fields.phone")} value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
              <Input label={t("fields.province")} value={form.province} onChange={(e) => update("province", e.target.value)} required />
              <Input label={t("fields.city")} value={form.city} onChange={(e) => update("city", e.target.value)} required />
              <Input label={t("fields.district")} value={form.district} onChange={(e) => update("district", e.target.value)} required />
              <Input label={t("fields.postalCode")} value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} required />
            </div>
            <Input label={t("fields.addressLine")} value={form.address_line} onChange={(e) => update("address_line", e.target.value)} required />
            <label className="flex items-center gap-2 font-body text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => update("is_default", e.target.checked)}
              />
              {t("setAsDefault")}
            </label>
            <div className="flex gap-3">
              <Button type="submit" loading={saving}>
                {t("saveAddress")}
              </Button>
              {editingId !== null && (
                <Button type="button" variant="secondary" onClick={closeForm}>
                  {tCommon("cancel")}
                </Button>
              )}
            </div>
          </form>
        )}

        {isLoading && <LoadingState rows={2} />}
        {!isLoading && addresses.length === 0 && (
          <EmptyState icon={MapPin} title={t("empty")} />
        )}
        <div className="flex flex-col gap-3">
          {addresses.map((address) => (
            <div key={address.id} className="flex items-center justify-between rounded-md border border-border bg-surface p-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="font-body text-sm font-semibold text-text-primary">{address.label}</p>
                  {address.is_default && <Badge variant="success">{t("defaultBadge")}</Badge>}
                </div>
                <p className="font-body text-sm text-text-secondary">
                  {address.recipient_name} · {address.phone}
                </p>
                <p className="font-body text-xs text-text-secondary">
                  {address.address_line}, {address.district}, {address.city}, {address.province}{" "}
                  {address.postal_code}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => openEditForm(address)} className="font-body text-sm font-medium text-primary">
                  {t("edit")}
                </button>
                <button onClick={() => handleDelete(address.id)} className="font-body text-sm font-medium text-danger">
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidebarPageShell>
  );
}
