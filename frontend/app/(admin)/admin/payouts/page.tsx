"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import InlineError from "@/components/ui/InlineError";
import PromptModal from "@/components/ui/PromptModal";
import { getPayouts, payCreator, type PayoutRow } from "@/services/admin";
import { formatCurrency } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";
import { toast } from "@/store/toast-store";

/** BR-007 (manual payout): admin transfers the money outside the app, then records the reference here. */
export default function PencairanKomisiPage() {
  const t = useTranslations("admin.payouts");
  const tPayout = useTranslations("admin.payoutMethods");
  const { data, isLoading, error } = useSWR("/admin/payouts", getPayouts);
  const rows = data?.data ?? [];
  const [paying, setPaying] = useState<PayoutRow | null>(null);

  async function handlePay(reference: string) {
    if (!paying) return;
    const row = paying;
    setPaying(null);
    try {
      await payCreator(row.creator_id, reference);
      toast(t("success", { name: row.brand_name ?? row.name ?? "" }), "success");
      mutate("/admin/payouts");
    } catch (err) {
      toast(getErrorMessage(err, t("error")), "danger");
    }
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>
        <p className="font-body text-sm text-text-secondary">
          {t("intro", { minimum: formatCurrency(data?.meta.minimum ?? 0) })}
        </p>
        {error && !data && <InlineError />}
        <DataTable<PayoutRow>
          columns={[
            { key: "creator", header: t("columns.creator") },
            { key: "destination", header: t("columns.destination") },
            { key: "count", header: t("columns.count") },
            { key: "total", header: t("columns.total") },
            { key: "actions", header: t("columns.actions") },
          ]}
          data={rows}
          isLoading={isLoading}
          getRowKey={(row) => row.creator_id}
          emptyState={<EmptyState icon={Wallet} title={t("empty")} />}
          renderRow={(row) => (
            <tr className="border-b border-border last:border-0">
              <td className="p-4 font-medium text-text-primary">{row.brand_name ?? row.name}</td>
              <td className="p-4 text-text-secondary">
                {row.has_destination ? (
                  <div className="flex flex-col">
                    <span>{`${row.payout_method ? tPayout(row.payout_method) : "-"} · ${row.payout_account_number}`}</span>
                    <span className="text-xs">{row.payout_account_holder}</span>
                  </div>
                ) : (
                  <Badge variant="warning">{t("noDestination")}</Badge>
                )}
              </td>
              <td className="p-4 text-text-secondary">{row.commission_count}</td>
              <td className="p-4 text-text-secondary">{formatCurrency(row.total_owed)}</td>
              <td className="p-4">
                {row.meets_minimum && row.has_destination ? (
                  <Button onClick={() => setPaying(row)}>{t("markPaid")}</Button>
                ) : (
                  <span className="text-xs text-text-secondary">
                    {row.meets_minimum ? t("noDestination") : t("belowMinimum")}
                  </span>
                )}
              </td>
            </tr>
          )}
        />
      </div>
      <PromptModal
        open={paying !== null}
        title={t("modalTitle", { name: paying?.brand_name ?? paying?.name ?? "" })}
        label={t("referenceLabel")}
        minLength={3}
        confirmLabel={t("confirm")}
        onConfirm={handlePay}
        onCancel={() => setPaying(null)}
      />
    </SidebarPageShell>
  );
}
