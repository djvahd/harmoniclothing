"use client";

import useSWR from "swr";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import StatCard from "@/components/ui/StatCard";
import { getSalesReport } from "@/services/admin";
import { formatCurrency } from "@/lib/format";

export default function SalesReportPage() {
  const { data, isLoading } = useSWR("/admin/reports/sales", () => getSalesReport());
  const report = data?.data;

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">Sales Report</h1>
        {report && (
          <p className="font-body text-xs text-text-secondary">
            Periode: {report.period.from} - {report.period.to} (30 hari terakhir)
          </p>
        )}
        {isLoading && <p className="font-body text-sm text-text-secondary">Memuat laporan...</p>}

        {report && (
          <>
            <div className="flex flex-wrap gap-4">
              <StatCard icon={DollarSign} label="Total Pendapatan" value={formatCurrency(Number(report.revenue.total))} />
              <StatCard icon={TrendingUp} label="Rata-rata Nilai Pesanan" value={formatCurrency(Number(report.revenue.average_order_value))} />
              <StatCard icon={ShoppingBag} label="Total Pesanan" value={String(report.orders.total)} />
            </div>

            <div className="rounded-md border border-border bg-surface p-5">
              <p className="font-body text-sm font-semibold text-text-primary">Pesanan per Status</p>
              <div className="mt-3 flex flex-wrap gap-4">
                {Object.entries(report.orders.by_status).map(([status, count]) => (
                  <p key={status} className="font-body text-xs text-text-secondary">
                    {status}: <span className="font-semibold text-text-primary">{count}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-border bg-surface p-5">
              <p className="font-body text-sm font-semibold text-text-primary">Top 5 Produk</p>
              <div className="mt-3 flex flex-col gap-2">
                {report.top_products.map((p) => (
                  <div key={p.product_id} className="flex justify-between font-body text-sm">
                    <span className="text-text-primary">{p.name}</span>
                    <span className="text-text-secondary">{p.total_sold} terjual</span>
                  </div>
                ))}
                {report.top_products.length === 0 && (
                  <p className="font-body text-xs text-text-secondary">Belum ada data.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </SidebarPageShell>
  );
}
