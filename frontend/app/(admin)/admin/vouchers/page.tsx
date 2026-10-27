"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Ticket } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import InlineError from "@/components/ui/InlineError";
import Input from "@/components/ui/Input";
import { createVoucher, getVouchers, updateVoucher, type Voucher, type VoucherInput, type VoucherType } from "@/services/admin";
import { formatCurrency, formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";
import { toast } from "@/store/toast-store";

const KEY = "/admin/vouchers";
const TYPES: VoucherType[] = ["nominal", "percent", "free_shipping"];

const EMPTY_FORM = {
  code: "",
  type: "nominal" as VoucherType,
  value: "",
  maxDiscount: "",
  minSubtotal: "",
  quota: "",
  startsAt: "",
  expiresAt: "",
};

/** #98: the admin creates and switches off voucher codes. Creators cannot, and vouchers never change commission. */
export default function VoucherPage() {
  const t = useTranslations("admin.vouchers");
  const { data, isLoading, error } = useSWR(KEY, getVouchers);
  const rows = data?.data ?? [];
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const set = (field: keyof typeof EMPTY_FORM) => (value: string) => setForm((f) => ({ ...f, [field]: value }));

  function discountLabel(v: Voucher) {
    const cap = v.max_discount !== null ? formatCurrency(v.max_discount) : null;
    if (v.type === "nominal") return t("discountNominal", { amount: formatCurrency(v.value) });
    if (v.type === "percent") {
      return cap ? t("discountPercent", { percent: Number(v.value), cap }) : t("discountPercentNoCap", { percent: Number(v.value) });
    }
    return cap ? t("discountFreeShipping", { cap }) : t("discountFreeShippingNoCap");
  }

  function validityLabel(v: Voucher) {
    if (!v.starts_at && !v.expires_at) return t("always");
    return [v.starts_at && t("from", { date: formatDate(v.starts_at) }), v.expires_at && t("until", { date: formatDate(v.expires_at) })]
      .filter(Boolean)
      .join(" ");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const payload: VoucherInput = {
      code: form.code,
      type: form.type,
      min_subtotal: form.minSubtotal ? Number(form.minSubtotal) : 0,
      max_discount: form.maxDiscount ? Number(form.maxDiscount) : null,
      quota: form.quota ? Number(form.quota) : null,
      starts_at: form.startsAt || null,
      expires_at: form.expiresAt || null,
    };
    if (form.type !== "free_shipping") payload.value = Number(form.value);
    try {
      const { data: created } = await createVoucher(payload);
      toast(t("created", { code: created.code }), "success");
      setForm(EMPTY_FORM);
      setFormOpen(false);
      mutate(KEY);
    } catch (err) {
      setFormError(getErrorMessage(err, t("error")));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(v: Voucher) {
    try {
      await updateVoucher(v.id, { is_active: !v.is_active });
      toast(t("updated"), "success");
      mutate(KEY);
    } catch (err) {
      toast(getErrorMessage(err, t("error")), "danger");
    }
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>
          <Button onClick={() => setFormOpen((open) => !open)}>{formOpen ? t("cancel") : t("add")}</Button>
        </div>
        <p className="font-body text-sm text-text-secondary">{t("intro")}</p>

        {formOpen && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t("fields.code")}
                value={form.code}
                onChange={(e) => set("code")(e.target.value.toUpperCase())}
                maxLength={40}
                pattern="[A-Za-z0-9_\-]+"
                required
              />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="voucher-type" className="font-body text-xs font-medium text-text-secondary">
                  {t("fields.type")}
                </label>
                <select
                  id="voucher-type"
                  value={form.type}
                  onChange={(e) => set("type")(e.target.value)}
                  className="rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none focus:border-primary"
                >
                  {TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`types.${type}`)}
                    </option>
                  ))}
                </select>
              </div>
              {form.type !== "free_shipping" && (
                <Input
                  label={form.type === "percent" ? t("fields.percent") : t("fields.value")}
                  type="number"
                  min={1}
                  max={form.type === "percent" ? 100 : undefined}
                  value={form.value}
                  onChange={(e) => set("value")(e.target.value)}
                  required
                />
              )}
              {form.type !== "nominal" && (
                <Input
                  label={t("fields.maxDiscount")}
                  type="number"
                  min={0}
                  value={form.maxDiscount}
                  onChange={(e) => set("maxDiscount")(e.target.value)}
                />
              )}
              <Input
                label={t("fields.minSubtotal")}
                type="number"
                min={0}
                value={form.minSubtotal}
                onChange={(e) => set("minSubtotal")(e.target.value)}
              />
              <Input label={t("fields.quota")} type="number" min={1} value={form.quota} onChange={(e) => set("quota")(e.target.value)} />
              <Input
                label={t("fields.startsAt")}
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => set("startsAt")(e.target.value)}
              />
              <Input
                label={t("fields.expiresAt")}
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => set("expiresAt")(e.target.value)}
              />
            </div>
            {formError && (
              <p role="alert" className="font-body text-xs text-danger">
                {formError}
              </p>
            )}
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>
                {t("save")}
              </Button>
            </div>
          </form>
        )}

        {error && !data && <InlineError />}
        <DataTable<Voucher>
          columns={[
            { key: "code", header: t("columns.code") },
            { key: "discount", header: t("columns.discount") },
            { key: "minSpend", header: t("columns.minSpend") },
            { key: "usage", header: t("columns.usage") },
            { key: "validity", header: t("columns.validity") },
            { key: "status", header: t("columns.status") },
            { key: "actions", header: t("columns.actions") },
          ]}
          data={rows}
          isLoading={isLoading}
          getRowKey={(row) => row.id}
          emptyState={<EmptyState icon={Ticket} title={t("empty")} />}
          renderRow={(v) => (
            <tr className="border-b border-border last:border-0">
              <td className="p-4 font-medium text-text-primary">{v.code}</td>
              <td className="p-4 text-text-secondary">{discountLabel(v)}</td>
              <td className="p-4 text-text-secondary">{formatCurrency(v.min_subtotal)}</td>
              <td className="p-4 text-text-secondary">
                {v.quota !== null ? t("usageOf", { used: v.redeemed, quota: v.quota }) : t("usageUnlimited", { used: v.redeemed })}
              </td>
              <td className="p-4 text-text-secondary">{validityLabel(v)}</td>
              <td className="p-4">
                <Badge variant={v.is_active ? "success" : "warning"}>{v.is_active ? t("active") : t("inactive")}</Badge>
              </td>
              <td className="p-4">
                <Button variant="secondary" onClick={() => toggleActive(v)}>
                  {v.is_active ? t("deactivate") : t("activate")}
                </Button>
              </td>
            </tr>
          )}
        />
      </div>
    </SidebarPageShell>
  );
}
