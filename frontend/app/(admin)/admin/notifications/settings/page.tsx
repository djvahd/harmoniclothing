"use client";

import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/layout/AdminSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingState from "@/components/ui/LoadingState";
import { getNotificationSettings, updateNotificationSetting } from "@/services/admin";
import { toast } from "@/store/toast-store";

/** Turning these off silently drops key customer/admin messages, so it needs a confirmation. */
const CRITICAL_TYPES = ["order.paid", "order.shipped"];

export default function KonfigurasiNotifikasiPage() {
  const t = useTranslations("admin.notificationSettings");
  const [pending, setPending] = useState<string[]>([]);
  const [confirmType, setConfirmType] = useState<string | null>(null);
  const { data, isLoading, mutate } = useSWR("/admin/notification-settings", getNotificationSettings);
  const settings = data?.data ?? [];

  // "order.paid" -> translation key "order_paid"; unknown future types fall back to the raw name.
  const typeKey = (type: string) => type.replace(/\./g, "_");
  const typeLabel = (type: string) =>
    t.has(`types.${typeKey(type)}.label`) ? t(`types.${typeKey(type)}.label`) : type;

  async function applyToggle(type: string, enabled: boolean) {
    setPending((p) => [...p, type]);
    // Flip the switch immediately; the refetch below reconciles (and reverts on failure).
    mutate(
      (current) =>
        current && {
          ...current,
          data: current.data.map((s) => (s.notification_type === type ? { ...s, is_enabled: enabled } : s)),
        },
      { revalidate: false },
    );
    try {
      await updateNotificationSetting(type, enabled);
      toast(t(enabled ? "enabledToast" : "disabledToast", { label: typeLabel(type) }), "success");
    } catch {
      // apiFetch already shows the error toast.
    } finally {
      setPending((p) => p.filter((x) => x !== type));
      mutate();
    }
  }

  function handleToggle(type: string, current: boolean) {
    if (current && CRITICAL_TYPES.includes(type)) setConfirmType(type);
    else applyToggle(type, !current);
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
              className="flex items-center justify-between gap-4 rounded-sm px-4 py-3"
            >
              <div className="flex min-w-0 flex-col">
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
                disabled={pending.includes(setting.notification_type)}
                aria-label={t("toggleAria", { label: typeLabel(setting.notification_type) })}
                onClick={() => handleToggle(setting.notification_type, setting.is_enabled)}
                className={
                  (setting.is_enabled
                    ? "flex h-6 w-11 shrink-0 items-center rounded-full bg-accent p-0.5"
                    : "flex h-6 w-11 shrink-0 items-center rounded-full bg-border p-0.5") +
                  " disabled:cursor-wait disabled:opacity-60"
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
      <ConfirmDialog
        open={confirmType !== null}
        title={t("confirmDisable.title")}
        message={t("confirmDisable.message", { label: confirmType ? typeLabel(confirmType) : "" })}
        confirmLabel={t("confirmDisable.confirm")}
        cancelLabel={t("confirmDisable.cancel")}
        onConfirm={() => {
          if (confirmType) applyToggle(confirmType, false);
          setConfirmType(null);
        }}
        onCancel={() => setConfirmType(null)}
      />
    </SidebarPageShell>
  );
}
