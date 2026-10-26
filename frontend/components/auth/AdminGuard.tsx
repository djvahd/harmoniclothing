"use client";

import { useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth-store";
import { useAuthModalStore } from "@/store/auth-modal-store";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth.guards");
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const openAuthModal = useAuthModalStore((state) => state.open);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (status !== "ready" || user) return;
    if (!useAuthModalStore.getState().view) openAuthModal("login");
  }, [status, user, openAuthModal, t]);

  if (status !== "ready" || !user) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-text-secondary" />
      </div>
    );
  }

  // Logged in but not an admin: say so instead of silently bouncing them
  // home, which reads as an unexplained logout.
  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-2 bg-background text-center">
        <ShieldAlert className="size-8 text-text-secondary" />
        <p className="font-body text-sm text-text-secondary">{t("adminAccessDenied")}</p>
        <Button href="/" variant="secondary" className="mt-3">
          {t("backHome")}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
