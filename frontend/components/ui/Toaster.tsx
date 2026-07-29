"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import clsx from "clsx";
import { useToastStore, type ToastVariant } from "@/store/toast-store";

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "bg-success text-success-fg",
  danger: "bg-danger text-danger-fg",
  warning: "bg-warning text-warning-fg",
  info: "bg-info text-info-fg",
};

const VARIANT_ICON: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
};

/** Fixed bottom-right toast stack, rendered once in AppProviders and driven entirely by `store/toast-store`. */
export default function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const Icon = VARIANT_ICON[t.variant];
        return (
          <div
            key={t.id}
            className={clsx(
              "flex items-center gap-2 rounded-md px-4 py-3 font-body text-sm shadow-md",
              VARIANT_STYLES[t.variant],
            )}
          >
            <Icon className="size-4 shrink-0" />
            <p className="flex-1">{t.message}</p>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Tutup notifikasi">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
