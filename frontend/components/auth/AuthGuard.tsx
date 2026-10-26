"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth-store";
import { useAuthModalStore } from "@/store/auth-modal-store";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const openAuthModal = useAuthModalStore((state) => state.open);
  const t = useTranslations("auth.guards");

  useEffect(() => {
    if (status !== "ready") return;

    if (!user) {
      if (!useAuthModalStore.getState().view) openAuthModal("login", t("guestMessage"));
    }
  }, [status, user, openAuthModal, t]);

  if (status === "ready" && !user) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("guestTitle")}</h1>
        <p className="font-body text-sm text-text-secondary">{t("guestDescription")}</p>
        <div className="flex gap-3">
          <Button onClick={() => openAuthModal("login", t("guestMessage"))}>{t("guestLogin")}</Button>
          <Button variant="secondary" onClick={() => openAuthModal("register")}>
            {t("guestRegister")}
          </Button>
        </div>
        <Link href="/catalog" className="font-body text-sm font-medium text-primary hover:underline">
          {t("guestCatalog")}
        </Link>
      </div>
    );
  }

  if (status !== "ready") {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-text-secondary" />
      </div>
    );
  }

  return <>{children}</>;
}
