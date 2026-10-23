"use client";

import { useState } from "react";
import useSWR from "swr";
import { Receipt } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { getPayments, type Payment } from "@/services/admin";
import { formatCurrency } from "@/lib/format";

export default function KelolaPembayaranPage() {
  const t = useTranslations("admin.payments");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSWR(["/admin/payments", page], () => getPayments({ page }));
  const payments = data?.data ?? [];
  const label = (group: "statuses" | "methods", value: string | null) => {
    if (!value) return "-";
    return t.has(`${group}.${value}`) ? t(`${group}.${value}`) : value.replace(/_/g, " ");
  };

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          {t("title")}
        </h1>
        <DataTable<Payment>
          columns={[
            { key: "order_number", header: t("columns.orderNumber") },
            { key: "customer", header: t("columns.customer") },
            { key: "method", header: t("columns.method") },
            { key: "amount", header: t("columns.amount") },
            { key: "status", header: t("columns.status") },
          ]}
          data={payments}
          isLoading={isLoading}
          getRowKey={(payment) => payment.id}
          emptyState={<EmptyState icon={Receipt} title={t("empty")} />}
          renderRow={(payment) => (
            <tr className="border-b border-border last:border-0">
              <td className="p-4 font-medium text-text-primary">{payment.order.order_number}</td>
              <td className="p-4 text-text-secondary">{payment.order.user.name}</td>
              <td className="p-4 text-text-secondary">{label("methods", payment.method)}</td>
              <td className="p-4 text-text-secondary">{formatCurrency(payment.amount)}</td>
              <td className="p-4">
                <Badge variant={payment.status === "berhasil" ? "success" : "warning"}>
                  {label("statuses", payment.status)}
                </Badge>
              </td>
            </tr>
          )}
        />
        {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
      </div>
    </SidebarPageShell>
  );
}
