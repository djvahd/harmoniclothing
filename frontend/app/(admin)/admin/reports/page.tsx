"use client";

import useSWR from "swr";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import StatCard from "@/components/ui/StatCard";
import LoadingState from "@/components/ui/LoadingState";
import { getSalesReport } from "@/services/admin";
import { formatCurrency } from "@/lib/format";

export default function SalesReportPage() {
  const t = useTranslations("admin.reports");
  const tCommon = useTranslations("common");
  const { data, isLoading } = useSWR("/admin/reports/sales", () => getSalesReport());
  const report = data?.data;

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>
        {report && (
          <p className="font-body text-xs text-text-secondary">
            {t("period", { from: report.period.from, to: report.period.to })}
          </p>
        )}
        {isLoading && <LoadingState variant="detail" />}

        {report && (
          <>
            <div className="flex flex-wrap gap-4">
              <StatCard icon={DollarSign} label={t("stats.totalRevenue")} value={formatCurrency(Number(report.revenue.total))} />
              <StatCard icon={TrendingUp} label={t("stats.avgOrderValue")} value={formatCurrency(Number(report.revenue.average_order_value))} />
              <StatCard icon={ShoppingBag} label={t("stats.totalOrders")} value={String(report.orders.total)} />
            </div>

            <div className="rounded-md border border-border bg-surface p-5">
              <p className="font-body text-sm font-semibold text-text-primary">{t("ordersByStatus")}</p>
              <div className="mt-3 flex flex-wrap gap-4">
                {Object.entries(report.orders.by_status).map(([status, count]) => (
                  <p key={status} className="font-body text-xs text-text-secondary">
                    {tCommon(`orderStatus.${status}`)}: <span className="font-semibold text-text-primary">{count}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-border bg-surface p-5">
              <p className="font-body text-sm font-semibold text-text-primary">{t("topProducts")}</p>
              <div className="mt-3 flex flex-col gap-2">
                {report.top_products.map((p) => (
                  <div key={p.product_id} className="flex justify-between font-body text-sm">
                    <span className="text-text-primary">{p.name}</span>
                    <span className="text-text-secondary">{t("unitsSold", { count: p.quantity_sold })}</span>
                  </div>
                ))}
                {report.top_products.length === 0 && (
                  <p className="font-body text-xs text-text-secondary">{tCommon("emptyGeneric")}</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </SidebarPageShell>
  );
}
