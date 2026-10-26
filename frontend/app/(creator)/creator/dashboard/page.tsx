"use client";

import Link from "next/link";
import useSWR from "swr";
import { CheckCircle2, Clock, Palette } from "lucide-react";
import { useTranslations } from "next-intl";
import CreatorSidebar from "@/components/layout/CreatorSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import StatCard from "@/components/ui/StatCard";
import DesignStatusBadge from "@/components/creator/DesignStatusBadge";
import SafeImage from "@/components/ui/SafeImage";
import { storageUrl } from "@/lib/storage";
import InlineError from "@/components/ui/InlineError";
import { getCreatorDashboard } from "@/services/creator";
import { getMyDesigns } from "@/services/creator";

export default function CreatorDashboardPage() {
  const t = useTranslations("creator.dashboard");
  const { data: dashboardData, error } = useSWR("/creator/dashboard", getCreatorDashboard);
  const { data: designsData } = useSWR("/creator/designs", getMyDesigns);
  const dashboard = dashboardData?.data;
  const designs = (designsData?.data ?? []).slice(0, 5);

  return (
    <SidebarPageShell sidebar={<CreatorSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          {t("title")}
        </h1>

        {error && !dashboardData && <InlineError />}

        <div className="flex flex-wrap gap-4">
          <StatCard icon={Palette} label={t("totalDesigns")} value={String(dashboard?.total_designs ?? 0)} />
          <StatCard icon={CheckCircle2} label={t("activeDesigns")} value={String(dashboard?.active_designs ?? 0)} />
          <StatCard icon={Clock} label={t("pendingApproval")} value={String(dashboard?.pending_designs ?? 0)} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="font-heading text-lg font-semibold text-text-primary">{t("latestDesigns")}</p>
            <Link href="/creator/designs" className="font-body text-sm font-medium text-primary">
              {t("viewAll")}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {designs.map((design) => {
              const thumbnail = storageUrl(design.thumbnail_path);
              return (
                <Link
                  key={design.id}
                  href={`/creator/designs/${design.id}`}
                  className="flex items-center gap-4 rounded-md border border-border bg-surface p-4"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-border">
                    {thumbnail && <SafeImage src={thumbnail} alt={design.title} fill className="object-cover" />}
                  </div>
                  <p className="flex-1 font-body text-sm font-semibold text-text-primary">{design.title}</p>
                  <DesignStatusBadge status={design.status} />
                </Link>
              );
            })}
            {designs.length === 0 && (
              <p className="font-body text-sm text-text-secondary">{t("empty")}</p>
            )}
          </div>
        </div>
      </div>
    </SidebarPageShell>
  );
}
