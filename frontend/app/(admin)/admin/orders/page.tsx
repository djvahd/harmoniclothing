"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { PackageSearch } from "lucide-react";
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
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from "@/lib/order-status";
import type { Order } from "@/types/order";

export default function KelolaPesananPage() {
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
        <h1 className="font-heading text-h3 font-semibold text-text-primary">Kelola Pesanan</h1>
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
          emptyState={<EmptyState icon={PackageSearch} title="Belum ada pesanan." />}
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
                  <Button
                    variant="danger"
                    loading={loadingId === order.id}
                    onClick={() => setRejectingId(order.id)}
                  >
                    Tolak
                  </Button>
                )}
              </td>
            </tr>
          )}
        />
        {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
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
