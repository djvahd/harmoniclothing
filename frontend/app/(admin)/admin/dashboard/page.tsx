"use client";

import useSWR from "swr";
import { AlertTriangle, DollarSign, Palette, ShoppingBag, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import StatCard from "@/components/ui/StatCard";
import InlineError from "@/components/ui/InlineError";
import { getDashboardSummary } from "@/services/admin";
import { formatCurrency } from "@/lib/format";

export default function AdminDashboardPage() {
  const t = useTranslations("admin.dashboard");
  const { data, error } = useSWR("/admin/dashboard", getDashboardSummary);
  const summary = data?.data;
  const needsAttention =
    (summary?.orders.menunggu_approval ?? 0) + (summary?.users.creators_pending ?? 0);

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          {t("title")}
        </h1>

        {error && !data && <InlineError />}

        {needsAttention > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-primary bg-primary/5 px-4 py-3">
            <AlertTriangle className="size-4 text-primary" />
            <p className="font-body text-sm text-text-primary">
              {t("attentionNotice", {
                count: needsAttention,
                pendingOrders: summary?.orders.menunggu_approval ?? 0,
                pendingCreators: summary?.users.creators_pending ?? 0,
              })}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <StatCard icon={ShoppingBag} label={t("stats.pendingOrders")} value={String(summary?.orders.menunggu_approval ?? 0)} />
          <StatCard icon={DollarSign} label={t("stats.totalRevenue")} value={formatCurrency(Number(summary?.revenue.total ?? 0))} />
          <StatCard icon={Users} label={t("stats.totalCustomers")} value={String(summary?.users.customers_total ?? 0)} />
          <StatCard icon={Palette} label={t("stats.pendingDesigns")} value={String(summary?.designs.pending ?? 0)} />
        </div>

        <div className="flex flex-wrap gap-4">
          <StatCard icon={ShoppingBag} label={t("stats.inProduction")} value={String(summary?.orders.diproses_produksi ?? 0)} />
          <StatCard icon={ShoppingBag} label={t("stats.shipped")} value={String(summary?.orders.dikirim ?? 0)} />
          <StatCard icon={ShoppingBag} label={t("stats.completed")} value={String(summary?.orders.selesai ?? 0)} />
          <StatCard icon={Users} label={t("stats.activeCreators")} value={String(summary?.users.creators_active ?? 0)} />
        </div>
      </div>
    </SidebarPageShell>
  );
}
