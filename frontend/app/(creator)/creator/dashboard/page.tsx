"use client";

import Link from "next/link";
import useSWR from "swr";
import { CheckCircle2, Clock, Palette } from "lucide-react";
import CreatorSidebar from "@/components/layout/CreatorSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import StatCard from "@/components/ui/StatCard";
import DesignCard from "@/components/ui/DesignCard";
import { getCreatorDashboard } from "@/services/creator";
import { getMyDesigns } from "@/services/creator";

export default function CreatorDashboardPage() {
  const { data: dashboardData } = useSWR("/creator/dashboard", getCreatorDashboard);
  const { data: designsData } = useSWR("/creator/designs", getMyDesigns);
  const dashboard = dashboardData?.data;
  const designs = (designsData?.data ?? []).slice(0, 5);

  return (
    <SidebarPageShell sidebar={<CreatorSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          Dashboard Kreator
        </h1>

        <div className="flex flex-wrap gap-4">
          <StatCard icon={Palette} label="Total Desain" value={String(dashboard?.total_designs ?? 0)} />
          <StatCard icon={CheckCircle2} label="Desain Aktif" value={String(dashboard?.active_designs ?? 0)} />
          <StatCard icon={Clock} label="Menunggu Approval" value={String(dashboard?.pending_designs ?? 0)} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="font-heading text-lg font-semibold text-text-primary">Desain Terbaru</p>
            <Link href="/creator/designs" className="font-body text-sm font-medium text-primary">
              Lihat Semua
            </Link>
          </div>
          <div className="flex flex-wrap gap-6">
            {designs.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
            {designs.length === 0 && (
              <p className="font-body text-sm text-text-secondary">
                Belum ada desain. Yuk upload desain pertamamu.
              </p>
            )}
          </div>
        </div>
      </div>
    </SidebarPageShell>
  );
}
