"use client";

import useSWR, { mutate } from "swr";
import clsx from "clsx";
import AccountSidebar from "@/components/layout/AccountSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import { getNotifications, markNotificationRead } from "@/services/notifications";

export default function NotifikasiPage() {
  const { data, isLoading } = useSWR("/notifications", getNotifications);
  const notifications = data?.data ?? [];

  async function handleClick(id: number, isRead: boolean) {
    if (isRead) return;
    await markNotificationRead(id);
    mutate("/notifications");
  }

  return (
    <SidebarPageShell sidebar={<AccountSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">Notifikasi</h1>

        {isLoading && <p className="font-body text-sm text-text-secondary">Memuat notifikasi...</p>}
        {!isLoading && notifications.length === 0 && (
          <p className="font-body text-sm text-text-secondary">Belum ada notifikasi.</p>
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
                  {new Date(n.created_at).toLocaleString("id-ID")}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </SidebarPageShell>
  );
}
