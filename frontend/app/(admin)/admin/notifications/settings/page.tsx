"use client";

import useSWR, { mutate } from "swr";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import LoadingState from "@/components/ui/LoadingState";
import { getNotificationSettings, updateNotificationSetting } from "@/services/admin";

export default function KonfigurasiNotifikasiPage() {
  const { data, isLoading } = useSWR("/admin/notification-settings", getNotificationSettings);
  const settings = data?.data ?? [];

  async function handleToggle(type: string, current: boolean) {
    await updateNotificationSetting(type, !current);
    mutate("/admin/notification-settings");
  }

  return (
    <SidebarPageShell sidebar={<AdminSidebar />}>
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">
          Konfigurasi Notifikasi
        </h1>
        {isLoading && <LoadingState rows={4} />}
        <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-2">
          {settings.map((setting) => (
            <div
              key={setting.notification_type}
              className="flex items-center justify-between rounded-sm px-4 py-3"
            >
              <p className="font-body text-sm font-medium text-text-primary">
                {setting.notification_type}
              </p>
              <button
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
