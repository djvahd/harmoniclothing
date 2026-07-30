"use client";

import clsx from "clsx";
import { Bell } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import AccountSidebar from "@/components/layout/AccountSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { markNotificationRead } from "@/services/notifications";
import { useNotifications, invalidateNotifications } from "@/hooks/useNotifications";

export default function NotifikasiPage() {
  const t = useTranslations("customer.notifications");
  const locale = useLocale();
  const { notifications, isLoading } = useNotifications();

  async function handleClick(id: number, isRead: boolean) {
    if (isRead) return;
    await markNotificationRead(id);
    invalidateNotifications();
  }

  return (
    <SidebarPageShell sidebar={<AccountSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>

        {isLoading && <LoadingState rows={4} />}
        {!isLoading && notifications.length === 0 && (
          <EmptyState icon={Bell} title={t("empty")} />
        )}

        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n.id, n.is_read)}
              className="flex items-start gap-3 rounded-md border border-border bg-surface p-4 text-left"
            >
              <span
                className={clsx(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  n.is_read ? "bg-transparent" : "bg-accent",
                )}
              />
              <div className="flex flex-col gap-1">
                <p className="font-body text-sm font-semibold text-text-primary">{n.title}</p>
                <p className="font-body text-sm text-text-secondary">{n.body}</p>
                <p className="font-body text-xs text-text-secondary">
                  {new Date(n.created_at).toLocaleString(locale === "id" ? "id-ID" : "en-US")}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </SidebarPageShell>
  );
}
