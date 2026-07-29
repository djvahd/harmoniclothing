"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Factory } from "lucide-react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import { getProductionQueue, updateOrderStatus } from "@/services/admin";
import { formatCurrency } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from "@/lib/order-status";
import type { Order } from "@/types/order";

export default function KelolaAntrianProduksiPage() {
  const { data, isLoading } = useSWR("/admin/production-queue", getProductionQueue);
  const orders = data?.data ?? [];
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleAdvance(id: number) {
    setLoadingId(id);
    try {
      await updateOrderStatus(id);
      mutate("/admin/production-queue");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          Kelola Antrian Produksi
        </h1>
        <DataTable<Order>
          columns={[
            { key: "order_number", header: "No. Pesanan" },
            { key: "total", header: "Total" },
            { key: "status", header: "Status" },
            { key: "actions", header: "Aksi" },
          ]}
          data={orders}
          isLoading={isLoading}
          getRowKey={(order) => order.id}
          emptyState={<EmptyState icon={Factory} title="Belum ada antrian produksi." />}
          renderRow={(order) => (
            <tr className="border-b border-border last:border-0">
              <td className="p-4 font-medium text-text-primary">{order.order_number}</td>
              <td className="p-4 text-text-secondary">{formatCurrency(order.total)}</td>
              <td className="p-4">
                <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                  {ORDER_STATUS_LABEL[order.status]}
                </Badge>
              </td>
              <td className="p-4">
                {order.status === "menunggu_approval" && (
                  <Button loading={loadingId === order.id} onClick={() => handleAdvance(order.id)}>
                    Mulai Produksi
                  </Button>
                )}
              </td>
            </tr>
          )}
        />
      </div>
    </SidebarPageShell>
  );
}
