"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PromptModal from "@/components/ui/PromptModal";
import { getProductionQueue, rejectOrder } from "@/services/admin";
import { formatCurrency } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from "@/lib/order-status";

export default function KelolaPesananPage() {
  const { data, isLoading } = useSWR("/admin/production-queue", getProductionQueue);
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
      mutate("/admin/production-queue");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">Kelola Pesanan</h1>
        <p className="font-body text-xs text-text-secondary">
          Menampilkan pesanan aktif (menunggu approval/diproses) - tidak ada endpoint admin untuk
          daftar semua pesanan termasuk yang selesai/dibatalkan.
        </p>
        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full text-left font-body text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="p-4">No. Pesanan</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="p-4 text-text-secondary" colSpan={4}>Memuat...</td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium text-text-primary">{order.order_number}</td>
                  <td className="p-4 text-text-secondary">{formatCurrency(order.total)}</td>
                  <td className="p-4">
                    <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {order.status === "menunggu_approval" && (
                      <Button variant="danger" loading={loadingId === order.id} onClick={() => setRejectingId(order.id)}>
                        Tolak
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PromptModal
        open={rejectingId !== null}
        title="Tolak Pesanan"
        label="Alasan penolakan"
        minLength={10}
        confirmLabel="Tolak"
        onConfirm={handleReject}
        onCancel={() => setRejectingId(null)}
      />
    </SidebarPageShell>
  );
}
