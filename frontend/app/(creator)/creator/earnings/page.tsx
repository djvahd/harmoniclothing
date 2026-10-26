"use client";

import useSWR from "swr";
import Link from "next/link";
import { Clock, Wallet, CheckCircle2, PauseCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import CreatorSidebar from "@/components/layout/CreatorSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { getEarnings } from "@/services/creator";
import { formatCurrency, formatDate } from "@/lib/format";

const STATUS_VARIANT = {
  terhutang: "warning",
  dibayar: "success",
  ditahan: "neutral",
} as const;

export default function StatistikKomisiPage() {
  const t = useTranslations("creator.earnings");
  const { data, isLoading } = useSWR("/creator/earnings", getEarnings);
  const commissions = data?.data ?? [];
  const summary = data?.summary;

  return (
    <SidebarPageShell sidebar={<CreatorSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          {t("title")}
        </h1>

        <div className="flex flex-wrap gap-4">
          <StatCard icon={Wallet} label={t("totalCommission")} value={formatCurrency(Number(summary?.total ?? 0))} />
          <StatCard icon={Clock} label={t("unpaid")} value={formatCurrency(Number(summary?.terhutang ?? 0))} />
          <StatCard icon={CheckCircle2} label={t("paid")} value={formatCurrency(Number(summary?.dibayar ?? 0))} />
          <StatCard icon={PauseCircle} label={t("held")} value={formatCurrency(Number(summary?.ditahan ?? 0))} />
        </div>

        <div className="flex flex-col gap-1 rounded-md border border-border bg-surface p-4">
          <p className="font-body text-sm font-semibold text-text-primary">{t("payoutInfo.title")}</p>
          <p className="font-body text-xs text-text-secondary">{t("payoutInfo.body")}</p>
          <Link href="/creator/profile" className="font-body text-xs font-medium text-primary underline">
            {t("payoutInfo.viewDetail")}
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-heading text-lg font-semibold text-text-primary">
            {t("commissionHistory")}
          </p>
          {isLoading && <LoadingState rows={3} />}
          {!isLoading && commissions.length === 0 && (
            <EmptyState icon={Wallet} title={t("empty")} />
          )}
          {commissions.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-md border border-border bg-surface p-4">
              <div className="flex flex-col">
                <p className="font-body text-sm font-semibold text-text-primary">
                  {formatCurrency(Number(c.amount))}
                </p>
                <p className="font-body text-xs text-text-secondary">
                  {c.status === "dibayar" && c.paid_at
                    ? t("paidOn", { date: formatDate(c.paid_at) })
                    : t("createdOn", { date: formatDate(c.created_at) })}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[c.status]}>{t(`commissionStatus.${c.status}`)}</Badge>
            </div>
          ))}
        </div>
      </div>
    </SidebarPageShell>
  );
}
