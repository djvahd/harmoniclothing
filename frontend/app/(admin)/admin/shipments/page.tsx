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
  const [bookingId, setBookingId] = useState<number | null>(null);

  async function handleBook(courier: string) {
    if (bookingId === null) return;
    const id = bookingId;
    setBookingId(null);
    setLoadingId(id);
    try {
      await bookShipment(id, courier);
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
              <td className="p-4 text-text-secondary">{order.shipment?.courier ?? "-"}</td>
              <td className="p-4 text-text-secondary">{order.shipment?.tracking_number ?? "-"}</td>
              <td className="p-4">
                <Badge variant={order.shipment ? "success" : "neutral"}>
                  {order.shipment ? t("booked") : t("notBooked")}
                </Badge>
              </td>
              <td className="p-4">
                {!order.shipment && (
                  <Button loading={loadingId === order.id} onClick={() => setBookingId(order.id)}>
                    {t("bookCourier")}
                  </Button>
                )}
              </td>
            </tr>
          )}
        />
      </div>
      <PromptModal
        open={bookingId !== null}
        title={t("bookModal.title")}
        label={t("bookModal.label")}
        minLength={1}
        confirmLabel={t("bookModal.confirm")}
        onConfirm={handleBook}
        onCancel={() => setBookingId(null)}
      />
    </SidebarPageShell>
  );
}
