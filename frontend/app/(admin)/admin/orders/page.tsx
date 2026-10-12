"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import OrderItemDesigns from "@/components/admin/OrderItemDesigns";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PromptModal from "@/components/ui/PromptModal";
import DataTable from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { getOrders, rejectOrder } from "@/services/admin";
import { formatCurrency } from "@/lib/format";
import { ORDER_STATUS_VARIANT } from "@/lib/order-status";
import type { Order } from "@/types/order";

export default function KelolaPesananPage() {
  const t = useTranslations("admin.orders");
  const tCommon = useTranslations("common");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSWR(["/admin/orders", page], () => getOrders({ page }));
  const orders = data?.data ?? [];
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  async function handleReject(reason: string) {
    if (rejectingId === null) return;
    const id = rejectingId;
    setRejectingId(null);
    setLoadingId(id);
    try {
      await rejectOrder(id, reason);
      mutate(["/admin/orders", page]);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>
        <DataTable<Order>
          columns={[
            { key: "order_number", header: t("columns.orderNumber") },
            { key: "total", header: t("columns.total") },
            { key: "status", header: t("columns.status") },
            { key: "actions", header: t("columns.actions") },
          ]}
          data={orders}
          isLoading={isLoading}
          getRowKey={(order) => order.id}
          emptyState={<EmptyState icon={PackageSearch} title={t("empty")} />}
          renderRow={(order) => (
            <>
            <tr className="border-b border-border last:border-0">
              <td className="p-4 font-medium text-text-primary">{order.order_number}</td>
              <td className="p-4 text-text-secondary">{formatCurrency(order.total)}</td>
              <td className="p-4">
                <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                  {tCommon(`orderStatus.${order.status}`)}
                </Badge>
              </td>
              <td className="p-4">
                {order.status === "menunggu_approval" && (
                  <Button
                    variant="danger"
                    loading={loadingId === order.id}
                    onClick={() => setRejectingId(order.id)}
                  >
                    {t("reject")}
                  </Button>
                )}
              </td>
            </tr>
            <OrderItemDesigns order={order} colSpan={4} />
            </>
          )}
        />
        {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
      </div>
      <PromptModal
        open={rejectingId !== null}
        title={t("rejectModal.title")}
        label={t("rejectModal.label")}
        minLength={10}
        confirmLabel={t("reject")}
        onConfirm={handleReject}
        onCancel={() => setRejectingId(null)}
      />
    </SidebarPageShell>
  );
}
