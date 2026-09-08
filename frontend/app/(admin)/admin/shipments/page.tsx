"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PromptModal from "@/components/ui/PromptModal";
import DataTable from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import { bookShipment, getProductionQueue } from "@/services/admin";
import type { Order } from "@/types/order";

export default function KelolaPengirimanPage() {
  const t = useTranslations("admin.shipments");
  const { data, isLoading } = useSWR("/admin/production-queue", getProductionQueue);
  const orders = (data?.data ?? []).filter((o) => o.status === "diproses_produksi");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [overrideId, setOverrideId] = useState<number | null>(null);

  /** Books directly using whatever courier the customer already chose (and paid shipping for) at checkout — no admin input needed. */
  async function handleBook(id: number) {
    setLoadingId(id);
    try {
      await bookShipment(id);
      mutate("/admin/production-queue");
    } finally {
      setLoadingId(null);
    }
  }

  /** Only used when the checkout-time courier turns out unavailable — value is "company:type", e.g. "jne:reg". */
  async function handleOverride(value: string) {
    if (overrideId === null) return;
    const id = overrideId;
    const [courier_company, courier_type] = value.split(":").map((s) => s.trim());
    setOverrideId(null);
    setLoadingId(id);
    try {
      await bookShipment(id, { courier_company, courier_type });
      mutate("/admin/production-queue");
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
            { key: "checkoutCourier", header: t("columns.checkoutCourier") },
            { key: "courier", header: t("columns.courier") },
            { key: "tracking", header: t("columns.tracking") },
            { key: "status", header: t("columns.status") },
            { key: "actions", header: t("columns.actions") },
          ]}
          data={orders}
          isLoading={isLoading}
          getRowKey={(order) => order.id}
          emptyState={
            <EmptyState icon={Truck} title={t("empty")} />
          }
          renderRow={(order) => (
            <tr className="border-b border-border last:border-0">
              <td className="p-4 font-medium text-text-primary">{order.order_number}</td>
              <td className="p-4 text-text-secondary">
                {order.courier_company ? `${order.courier_company} ${order.courier_type ?? ""}`.trim() : "-"}
              </td>
              <td className="p-4 text-text-secondary">{order.shipment?.courier ?? "-"}</td>
              <td className="p-4 text-text-secondary">{order.shipment?.tracking_number ?? "-"}</td>
              <td className="p-4">
                <Badge variant={order.shipment ? "success" : "neutral"}>
                  {order.shipment ? t("booked") : t("notBooked")}
                </Badge>
              </td>
              <td className="p-4">
                {!order.shipment && (
                  <div className="flex gap-2">
                    <Button loading={loadingId === order.id} onClick={() => handleBook(order.id)}>
                      {t("bookCourier")}
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={loadingId === order.id}
                      onClick={() => setOverrideId(order.id)}
                    >
                      {t("overrideCourier")}
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          )}
        />
      </div>
      <PromptModal
        open={overrideId !== null}
        title={t("overrideModal.title")}
        label={t("overrideModal.label")}
        minLength={3}
        confirmLabel={t("overrideModal.confirm")}
        onConfirm={handleOverride}
        onCancel={() => setOverrideId(null)}
      />
    </SidebarPageShell>
  );
}
