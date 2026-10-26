"use client";

import { useState } from "react";
import useSWR from "swr";
import { ScrollText } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import DataTable from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { getAuditLogs, type AuditLog } from "@/services/admin";
import { formatCurrency, formatDateTime } from "@/lib/format";

/** Action codes the backend records (AuditLogService::record callers); unknown future codes fall back to the raw code. */
const ACTIONS = [
  "product.create", "product.update", "variant.create", "variant.update", "bulk_pricing_tier.create",
  "design.approve", "design.reject", "creator.approve", "creator.reject", "creator.ban",
  "order.status_update", "order.reject", "order.shipment_book", "payout.paid", "notification_setting.update",
];

/** 2.5_Permission_Matrix.md §10 — read-only trail of Admin actions (approve/reject/status changes). */
export default function AuditLogPage() {
  const t = useTranslations("admin.auditLog");
  const tCommon = useTranslations("common");
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const { data, isLoading } = useSWR(["/admin/audit-logs", page, action], () =>
    getAuditLogs({ page, action: action || undefined }),
  );
  const logs = data?.data ?? [];

  const key = (v: string) => v.replace(/\./g, "_");
  const actionLabel = (code: string) => (t.has(`actions.${key(code)}`) ? t(`actions.${key(code)}`) : code);

  function entityLabel(log: AuditLog) {
    if (!log.entity_type) return "—";
    const model = log.entity_type.split("\\").pop() ?? "";
    const name = t.has(`entities.${model}`) ? t(`entities.${model}`) : model;
    return log.entity_id ? `${name} #${log.entity_id}` : name;
  }

  /** Turns the machine-written description (e.g. "base_price: 491000.00") into a readable sentence. */
  function describe(log: AuditLog) {
    const d = log.description;
    if (!d) return "—";
    const money = d.match(/^(base_price|price_modifier): (-?[\d.]+)$/);
    if (money) return t(`descriptions.${money[1]}`, { value: formatCurrency(money[2]) });
    const toggle = d.match(/^is_enabled: (.*)$/);
    if (toggle) return t(toggle[1] === "1" || toggle[1] === "true" ? "descriptions.enabled" : "descriptions.disabled");
    const courier = d.match(/^courier: (.+)$/);
    if (courier) return t("descriptions.courier", { value: courier[1] });
    if (log.action === "order.status_update" && tCommon.has(`orderStatus.${d}`)) {
      return t("descriptions.statusTo", { status: tCommon(`orderStatus.${d}`) });
    }
    return d;
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>
        <label className="flex max-w-xs flex-col gap-1 font-body text-xs text-text-secondary">
          {t("filterAction")}
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            className="rounded-sm border border-border bg-surface px-3 py-2 text-sm text-text-primary"
          >
            <option value="">{t("allActions")}</option>
            {ACTIONS.map((code) => (
              <option key={code} value={code}>
                {actionLabel(code)}
              </option>
            ))}
          </select>
        </label>
        <DataTable<AuditLog>
          columns={[
            { key: "created_at", header: t("columns.time") },
            { key: "actor", header: t("columns.admin") },
            { key: "action", header: t("columns.action") },
            { key: "entity", header: t("columns.entity") },
            { key: "description", header: t("columns.description") },
          ]}
          data={logs}
          isLoading={isLoading}
          getRowKey={(log) => log.id}
          emptyState={<EmptyState icon={ScrollText} title={t("empty")} />}
          renderRow={(log) => (
            <tr className="border-b border-border last:border-0">
              <td className="p-4 whitespace-nowrap text-text-secondary">
                {formatDateTime(log.created_at)}
              </td>
              <td className="p-4 font-medium text-text-primary">{log.actor.name}</td>
              <td className="p-4 text-text-secondary">{actionLabel(log.action)}</td>
              <td className="p-4 text-text-secondary">
                {entityLabel(log)}
              </td>
              <td className="p-4 text-text-secondary">{describe(log)}</td>
            </tr>
          )}
        />
        {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
      </div>
    </SidebarPageShell>
  );
}
