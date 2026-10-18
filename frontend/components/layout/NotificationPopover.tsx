"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useNotifications, invalidateNotifications } from "@/hooks/useNotifications";
import { markNotificationRead } from "@/services/notifications";
import { formatDate } from "@/lib/format";

/** Header bell icon + hover dropdown preview (first 3, mark-all-read, link to full inbox). */
export default function NotificationPopover({
  open,
  onOpen,
  onScheduleClose,
  onCancelClose,
  onNavigate,
}: {
  open: boolean;
  onOpen: () => void;
  onScheduleClose: () => void;
  onCancelClose: () => void;
  onNavigate: () => void;
}) {
  const t = useTranslations("layout.notifications");
  const tCommon = useTranslations("common");
  const { notifications, isLoading } = useNotifications();
  const preview = notifications.slice(0, 3);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function handleMarkAllRead() {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => markNotificationRead(n.id)));
    await invalidateNotifications();
  }

  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onScheduleClose}>
      <button type="button" aria-label={t("aria")} className="relative text-text-primary">
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-danger-fg">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
          <div
            onMouseEnter={onCancelClose}
            className="absolute left-0 top-full z-40 mt-2 w-[300px] max-w-[calc(100vw-2rem)] rounded-md border border-border bg-surface shadow-lg"
          >
          <div className="px-4 py-2.5">
            <p className="font-body text-sm font-semibold text-text-primary">{t("title")}</p>
          </div>
          <div className="border-t border-border" />
          {isLoading ? (
            <div className="flex animate-pulse flex-col">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2 px-4 py-2.5">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="h-3 w-4/5 rounded-sm bg-border" />
                    <div className="h-2.5 w-1/3 rounded-sm bg-border" />
                  </div>
                </div>
              ))}
            </div>
          ) : preview.length === 0 ? (
            <p className="px-4 py-4 text-center font-body text-sm text-text-secondary">
              {t("empty")}
            </p>
          ) : (
            <div className="flex flex-col">
              {preview.map((n) => (
                <Link
                  key={n.id}
                  href="/notifications"
                  onClick={() => {
                    if (!n.is_read) markNotificationRead(n.id).then(invalidateNotifications);
                    onNavigate();
                  }}
                  className="flex items-start gap-2 px-4 py-2.5 transition-colors hover:bg-background"
                >
                  {!n.is_read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />}
                  <div className={n.is_read ? "ml-3.5 flex-1" : "flex-1"}>
                    <p className="font-body text-sm text-text-primary">{n.title}</p>
                    <p className="font-body text-xs text-text-secondary">{formatDate(n.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="border-t border-border" />
          <div className="flex items-center justify-between px-4 py-2.5">
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="font-body text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              {t("markAllRead")}
            </button>
            <Link
              href="/notifications"
              onClick={onNavigate}
              className="font-body text-xs font-medium text-primary transition-colors hover:text-accent hover:underline hover:underline-offset-4"
            >
              {tCommon("viewAll")}
            </Link>
          </div>
          </div>
      )}
    </div>
  );
}
