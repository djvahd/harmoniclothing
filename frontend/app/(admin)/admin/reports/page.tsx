"use client";

import { useState } from "react";
import useSWR from "swr";
import { DollarSign, Download, ShoppingBag, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import { getSalesReport, type SalesReport } from "@/services/admin";
import { formatCurrency, formatDate } from "@/lib/format";

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

/** Client-side CSV export of the report currently on screen. */
function downloadCsv(report: SalesReport, statusLabel: (s: string) => string, labels: Record<string, string>) {
  const rows: (string | number)[][] = [
    [labels.period, `${report.period.from.slice(0, 10)} - ${report.period.to.slice(0, 10)}`],
    [labels.totalRevenue, report.revenue.total],
    [labels.avgOrderValue, report.revenue.average_order_value],
    [labels.totalOrders, report.orders.total],
    [],
    [labels.ordersByStatus],
    ...Object.entries(report.orders.by_status).map(([s, c]) => [statusLabel(s), c]),
    [],
    [labels.topProducts, labels.quantity, labels.revenue],
    ...report.top_products.map((p) => [p.name, p.quantity_sold, p.revenue]),
  ];
  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `laporan-penjualan-${report.period.from.slice(0, 10)}_${report.period.to.slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SalesReportPage() {
  const t = useTranslations("admin.reports");
  const tCommon = useTranslations("common");
  // Empty = let the API default to the last 30 days.
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const invalidRange = Boolean(from && to && from > to);
  const { data, isLoading } = useSWR(invalidRange ? null : ["/admin/reports/sales", from, to], () =>
    getSalesReport({ from: from || undefined, to: to || undefined }),
  );
  const report = data?.data;

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 font-body text-xs text-text-secondary">
            {t("filter.from")}
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-sm border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            />
          </label>
          <label className="flex flex-col gap-1 font-body text-xs text-text-secondary">
            {t("filter.to")}
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-sm border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            />
          </label>
          {(from || to) && (
            <Button variant="secondary" onClick={() => { setFrom(""); setTo(""); }}>
              {t("filter.reset")}
            </Button>
          )}
          <Button
            variant="secondary"
            disabled={!report}
            onClick={() =>
              report &&
              downloadCsv(report, (s) => tCommon(`orderStatus.${s}`), {
                period: t("csv.period"),
                totalRevenue: t("stats.totalRevenue"),
                avgOrderValue: t("stats.avgOrderValue"),
                totalOrders: t("stats.totalOrders"),
                ordersByStatus: t("ordersByStatus"),
                topProducts: t("topProducts"),
                quantity: t("csv.quantity"),
                revenue: t("csv.revenue"),
              })
            }
          >
            <Download className="size-4" />
            {t("exportCsv")}
          </Button>
        </div>
        {invalidRange && <p className="font-body text-xs text-danger">{t("filter.invalid")}</p>}
        {report && (
          <p className="font-body text-xs text-text-secondary">
            {t("period", { from: formatDate(report.period.from), to: formatDate(report.period.to) })}
            {" · "}
            {t("scopeNote")}
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
              <p className="mt-1 font-body text-xs text-text-secondary">{t("topProductsNote")}</p>
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
