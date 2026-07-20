"use client";

import useSWR from "swr";
import { AlertTriangle, DollarSign, Palette, ShoppingBag, Users } from "lucide-react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import StatCard from "@/components/ui/StatCard";
import { getDashboardSummary } from "@/services/admin";
import { formatCurrency } from "@/lib/format";

export default function AdminDashboardPage() {
  const { data } = useSWR("/admin/dashboard", getDashboardSummary);
  const summary = data?.data;
  const needsAttention =
    (summary?.orders.menunggu_approval ?? 0) + (summary?.users.creators_pending ?? 0);

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          Dashboard Admin
        </h1>

        {needsAttention > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-primary bg-primary/5 px-4 py-3">
            <AlertTriangle className="size-4 text-primary" />
            <p className="font-body text-sm text-text-primary">
              {needsAttention} item perlu perhatian: {summary?.orders.menunggu_approval ?? 0}{" "}
              pesanan menunggu approval, {summary?.users.creators_pending ?? 0} creator menunggu
              approval.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <StatCard icon={ShoppingBag} label="Pesanan Menunggu Approval" value={String(summary?.orders.menunggu_approval ?? 0)} />
          <StatCard icon={DollarSign} label="Total Pendapatan" value={formatCurrency(Number(summary?.revenue.total ?? 0))} />
          <StatCard icon={Users} label="Total Customer" value={String(summary?.users.customers_total ?? 0)} />
          <StatCard icon={Palette} label="Desain Menunggu Approval" value={String(summary?.designs.pending ?? 0)} />
        </div>

        <div className="flex flex-wrap gap-4">
          <StatCard icon={ShoppingBag} label="Diproses Produksi" value={String(summary?.orders.diproses_produksi ?? 0)} />
          <StatCard icon={ShoppingBag} label="Dikirim" value={String(summary?.orders.dikirim ?? 0)} />
          <StatCard icon={ShoppingBag} label="Selesai" value={String(summary?.orders.selesai ?? 0)} />
          <StatCard icon={Users} label="Creator Aktif" value={String(summary?.users.creators_active ?? 0)} />
        </div>
      </div>
    </SidebarPageShell>
  );
}
