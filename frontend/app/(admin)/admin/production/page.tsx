"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Factory } from "lucide-react";
import { useTranslations } from "next-intl";
import OrderItemDesigns from "@/components/admin/OrderItemDesigns";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import { getProductionQueue, updateOrderStatus } from "@/services/admin";
import { formatCurrency } from "@/lib/format";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "@/store/toast-store";
import { ORDER_STATUS_VARIANT } from "@/lib/order-status";
import type { Order } from "@/types/order";

export default function KelolaAntrianProduksiPage() {
  const t = useTranslations("admin.production");
  const tCommon = useTranslations("common");
  const { data, isLoading } = useSWR("/admin/production-queue", getProductionQueue);
  const orders = data?.data ?? [];
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [starting, setStarting] = useState<Order | null>(null);

  async function handleAdvance() {
    if (!starting) return;
    const id = starting.id;
    setStarting(null);
    setLoadingId(id);
    try {
      await updateOrderStatus(id);
      mutate("/admin/production-queue");
      toast(t("startSuccess"), "success");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          {t("title")}
        </h1>
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
          emptyState={<EmptyState icon={Factory} title={t("empty")} />}
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
                  <Button loading={loadingId === order.id} onClick={() => setStarting(order)}>
                    {t("startProduction")}
                  </Button>
                )}
              </td>
            </tr>
            <OrderItemDesigns order={order} colSpan={4} />
            </>
          )}
        />
      </div>
      <ConfirmDialog
        open={starting !== null}
        title={t("startConfirmTitle")}
        message={t("startConfirmMessage", { orderNumber: starting?.order_number ?? "" })}
        confirmLabel={t("startProduction")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleAdvance}
        onCancel={() => setStarting(null)}
      />
    </SidebarPageShell>
  );
}
