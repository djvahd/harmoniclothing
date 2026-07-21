"use client";

import useSWR from "swr";
import { Clock, Wallet, CheckCircle2 } from "lucide-react";
import CreatorSidebar from "@/components/layout/CreatorSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { getEarnings } from "@/services/creator";
import { formatCurrency } from "@/lib/format";

const STATUS_VARIANT = {
  terhutang: "warning",
  dibayar: "success",
  ditahan: "neutral",
} as const;

export default function StatistikKomisiPage() {
  const { data, isLoading } = useSWR("/creator/earnings", getEarnings);
  const commissions = data?.data ?? [];
  const summary = data?.summary;

  return (
    <SidebarPageShell sidebar={<CreatorSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          Statistik & Komisi
        </h1>

        <div className="flex flex-wrap gap-4">
          <StatCard icon={Wallet} label="Total Komisi" value={formatCurrency(Number(summary?.total ?? 0))} />
          <StatCard icon={Clock} label="Belum Dibayar" value={formatCurrency(Number(summary?.terhutang ?? 0))} />
          <StatCard icon={CheckCircle2} label="Sudah Dibayar" value={formatCurrency(Number(summary?.dibayar ?? 0))} />
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-heading text-lg font-semibold text-text-primary">
            Riwayat Pencairan
          </p>
          {isLoading && <p className="font-body text-sm text-text-secondary">Memuat...</p>}
          {!isLoading && commissions.length === 0 && (
            <p className="font-body text-sm text-text-secondary">Belum ada komisi.</p>
          )}
          {commissions.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-md border border-border bg-surface p-4">
              <div className="flex flex-col">
                <p className="font-body text-sm font-semibold text-text-primary">
                  {formatCurrency(Number(c.amount))}
                </p>
                <p className="font-body text-xs text-text-secondary">
                  {new Date(c.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </SidebarPageShell>
  );
}
