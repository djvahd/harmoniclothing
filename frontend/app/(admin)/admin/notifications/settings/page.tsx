"use client";

import useSWR, { mutate } from "swr";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import LoadingState from "@/components/ui/LoadingState";
import { getNotificationSettings, updateNotificationSetting } from "@/services/admin";

export default function KonfigurasiNotifikasiPage() {
  const t = useTranslations("admin.notificationSettings");
  const { data, isLoading } = useSWR("/admin/notification-settings", getNotificationSettings);
  const settings = data?.data ?? [];

  // "order.paid" -> translation key "order_paid"; unknown future types fall back to the raw name.
  const typeKey = (type: string) => type.replace(/\./g, "_");
  const typeLabel = (type: string) =>
    t.has(`types.${typeKey(type)}.label`) ? t(`types.${typeKey(type)}.label`) : type;

  async function handleToggle(type: string, current: boolean) {
    await updateNotificationSetting(type, !current);
    mutate("/admin/notification-settings");
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          {t("title")}
        </h1>
        {isLoading && <LoadingState rows={4} />}
        <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-2">
          {settings.map((setting) => (
            <div
              key={setting.notification_type}
              className="flex items-center justify-between rounded-sm px-4 py-3"
            >
              <div className="flex flex-col">
                <p className="font-body text-sm font-medium text-text-primary">
                  {typeLabel(setting.notification_type)}
                </p>
                {t.has(`types.${typeKey(setting.notification_type)}.description`) && (
                  <p className="font-body text-xs text-text-secondary">
                    {t(`types.${typeKey(setting.notification_type)}.description`)}
                  </p>
                )}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={setting.is_enabled}
                aria-label={t("toggleAria", { label: typeLabel(setting.notification_type) })}
                onClick={() => handleToggle(setting.notification_type, setting.is_enabled)}
                className={
                  setting.is_enabled
                    ? "flex h-6 w-11 items-center rounded-full bg-accent p-0.5"
                    : "flex h-6 w-11 items-center rounded-full bg-border p-0.5"
                }
              >
                <span
                  className={
                    setting.is_enabled
                      ? "size-5 translate-x-5 rounded-full bg-white transition-transform"
                      : "size-5 translate-x-0 rounded-full bg-white transition-transform"
                  }
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </SidebarPageShell>
  );
}
