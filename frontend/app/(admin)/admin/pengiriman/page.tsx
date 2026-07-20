"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { bookShipment, getProductionQueue } from "@/services/admin";

export default function KelolaPengirimanPage() {
  const { data, isLoading } = useSWR("/admin/production-queue", getProductionQueue);
  const orders = (data?.data ?? []).filter((o) => o.status === "diproses_produksi");
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleBook(id: number) {
    const courier = window.prompt("Nama kurir (mis. JNE, J&T):");
    if (!courier) return;
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
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          Kelola Pengiriman
        </h1>
        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full text-left font-body text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="p-4">No. Pesanan</th>
                <th className="p-4">Kurir</th>
                <th className="p-4">Resi</th>
                <th className="p-4">Status</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="p-4 text-text-secondary" colSpan={5}>Memuat...</td>
                </tr>
              )}
              {orders.length === 0 && !isLoading && (
                <tr>
                  <td className="p-4 text-text-secondary" colSpan={5}>
                    Tidak ada pesanan siap dikirim.
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
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
                      <Button loading={loadingId === order.id} onClick={() => handleBook(order.id)}>
                        Booking Kurir
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarPageShell>
  );
}
