"use client";

import { useState } from "react";
import { mutate } from "swr";
import { useTranslations } from "next-intl";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "@/store/toast-store";
import { useBulkPricingTiers } from "@/hooks/useBulkPricing";
import { createBulkPricingTier } from "@/services/admin";
import { getErrorMessage } from "@/lib/api";
import { swrKeys } from "@/lib/swr-keys";
import { formatCurrency } from "@/lib/format";

const EMPTY_FORM = { min_qty: "", max_qty: "", price_per_unit: "" };

/** BR-012: the single global tier table for Bulk Orders — list + add (the API has no edit/delete). */
export default function BulkPricingTiers() {
  const t = useTranslations("admin.catalog.bulkTiers");
  const tCommon = useTranslations("common");
  const { tiers, isLoading } = useBulkPricingTiers();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfirming(true);
  }

  async function handleConfirm() {
    setConfirming(false);
    setSaving(true);
    setError(null);
    try {
      await createBulkPricingTier({
        min_qty: Number(form.min_qty),
        max_qty: form.max_qty ? Number(form.max_qty) : undefined,
        price_per_unit: Number(form.price_per_unit),
      });
      await mutate(swrKeys.bulkPricingTiers());
      setForm(EMPTY_FORM);
      toast(t("saved"), "success");
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold text-text-primary">{t("title")}</h2>
        <p className="font-body text-xs text-text-secondary">{t("hint")}</p>
      </div>

      <table className="w-full text-left font-body text-sm">
        <thead className="border-b border-border text-text-secondary">
          <tr>
            <th className="p-2">{t("minQty")}</th>
            <th className="p-2">{t("maxQty")}</th>
            <th className="p-2">{t("pricePerUnit")}</th>
          </tr>
        </thead>
        <tbody>
          {!isLoading && tiers.length === 0 && (
            <tr>
              <td colSpan={3} className="p-2 text-text-secondary">{t("empty")}</td>
            </tr>
          )}
          {tiers.map((tier) => (
            <tr key={tier.min_qty} className="border-b border-border last:border-0">
              <td className="p-2 text-text-primary">{tier.min_qty}</td>
              <td className="p-2 text-text-secondary">{tier.max_qty ?? t("unlimited")}</td>
              <td className="p-2 text-text-primary">{formatCurrency(tier.price_per_unit)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end">
          <Input label={t("minQty")} type="number" min={1} value={form.min_qty} onChange={(e) => setForm((f) => ({ ...f, min_qty: e.target.value }))} required />
          <Input label={t("maxQtyOptional")} type="number" min={1} value={form.max_qty} onChange={(e) => setForm((f) => ({ ...f, max_qty: e.target.value }))} />
          <Input label={t("pricePerUnit")} type="number" min={0} value={form.price_per_unit} onChange={(e) => setForm((f) => ({ ...f, price_per_unit: e.target.value }))} required />
        </div>
        {error && <p className="font-body text-xs text-danger">{error}</p>}
        <div>
          <Button type="submit" loading={saving}>{t("add")}</Button>
        </div>
      </form>
      <ConfirmDialog
        open={confirming}
        title={t("confirmTitle")}
        message={t("confirmMessage")}
        confirmLabel={t("add")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
      />
    </section>
  );
}
