"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Truck } from "lucide-react";
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
          Kelola Pengiriman
        </h1>
        <DataTable<Order>
          columns={[
            { key: "order_number", header: "No. Pesanan" },
            { key: "courier", header: "Kurir" },
            { key: "tracking", header: "Resi" },
            { key: "status", header: "Status" },
            { key: "actions", header: "Aksi" },
          ]}
          data={orders}
          isLoading={isLoading}
          getRowKey={(order) => order.id}
          emptyState={
            <EmptyState icon={Truck} title="Tidak ada pesanan siap dikirim." />
          }
          renderRow={(order) => (
            <tr className="border-b border-border last:border-0">
              <td className="p-4 font-medium text-text-primary">{order.order_number}</td>
              <td className="p-4 text-text-secondary">{order.shipment?.courier ?? "-"}</td>
              <td className="p-4 text-text-secondary">{order.shipment?.tracking_number ?? "-"}</td>
              <td className="p-4">
                <Badge variant={order.shipment ? "success" : "neutral"}>
                  {order.shipment ? "Sudah Dibooking" : "Belum Dibooking"}
                </Badge>
              </td>
              <td className="p-4">
                {!order.shipment && (
                  <Button loading={loadingId === order.id} onClick={() => setBookingId(order.id)}>
                    Booking Kurir
                  </Button>
                )}
              </td>
            </tr>
          )}
        />
      </div>
      <PromptModal
        open={bookingId !== null}
        title="Booking Kurir"
        label="Nama kurir (mis. JNE, J&T)"
        minLength={1}
        confirmLabel="Booking"
        onConfirm={handleBook}
        onCancel={() => setBookingId(null)}
      />
    </SidebarPageShell>
  );
}
