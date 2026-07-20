"use client";

import useSWR from "swr";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Badge from "@/components/ui/Badge";
import { getPayments } from "@/services/admin";
import { formatCurrency } from "@/lib/format";

export default function KelolaPembayaranPage() {
  const { data, isLoading } = useSWR("/admin/payments", () => getPayments());
  const payments = data?.data ?? [];

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          Kelola Pembayaran & Invoice
        </h1>
        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full text-left font-body text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="p-4">No. Pesanan</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Metode</th>
                <th className="p-4">Jumlah</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="p-4 text-text-secondary" colSpan={5}>Memuat...</td>
                </tr>
              )}
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium text-text-primary">{payment.order.order_number}</td>
                  <td className="p-4 text-text-secondary">{payment.order.user.name}</td>
                  <td className="p-4 text-text-secondary">{payment.method}</td>
                  <td className="p-4 text-text-secondary">{formatCurrency(payment.amount)}</td>
                  <td className="p-4">
                    <Badge variant={payment.status === "berhasil" ? "success" : "warning"}>
                      {payment.status}
                    </Badge>
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
