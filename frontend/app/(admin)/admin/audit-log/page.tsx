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
import { formatDateTime } from "@/lib/format";

/** 2.5_Permission_Matrix.md §10 — read-only trail of Admin actions (approve/reject/status changes). */
export default function AuditLogPage() {
  const t = useTranslations("admin.auditLog");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSWR(["/admin/audit-logs", page], () => getAuditLogs({ page }));
  const logs = data?.data ?? [];

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>
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
              <td className="p-4 text-text-secondary">{log.action}</td>
              <td className="p-4 text-text-secondary">
                {log.entity_type
                  ? `${log.entity_type.split("\\").pop()}${log.entity_id ? ` #${log.entity_id}` : ""}`
                  : "—"}
              </td>
              <td className="p-4 text-text-secondary">{log.description ?? "—"}</td>
            </tr>
          )}
        />
        {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
      </div>
    </SidebarPageShell>
  );
}
