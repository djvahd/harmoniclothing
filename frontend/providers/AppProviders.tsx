"use client";

import { useEffect } from "react";
import { SWRConfig } from "swr";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/store/auth-store";
import { useAuthModalStore } from "@/store/auth-modal-store";
import AuthModal from "@/components/auth/AuthModal";
import Toaster from "@/components/ui/Toaster";
import { ApiError } from "@/lib/api";
import { toast } from "@/store/toast-store";

const recentLoadErrors = new Map<string, number>();

/** A page fetch that failed for server/network reasons gets one toast per key per 15s (SWR retries would otherwise repeat it). */
function reportLoadError(err: unknown, key: string) {
  if (!(err instanceof ApiError) || (err.status !== 0 && err.status < 500)) return;
  const now = Date.now();
  if (now - (recentLoadErrors.get(key) ?? 0) < 15000) return;
  recentLoadErrors.set(key, now);
  const en = document.cookie.includes("NEXT_LOCALE=en");
  toast(en ? "Could not load data. Please try again." : "Gagal memuat data. Silakan coba lagi.", "danger");
}

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const fetchMe = useAuthStore((state) => state.fetchMe);

  const locale = useLocale();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // A 401 from any API call means the session is gone: forget the user and reopen login.
  useEffect(() => {
    const onUnauthorized = () => {
      const { user, setUser } = useAuthStore.getState();
      if (!user) return;
      setUser(null);
      useAuthModalStore
        .getState()
        .open("login", locale === "en" ? "Your session has ended. Please sign in again." : "Sesi Anda telah berakhir. Silakan masuk lagi.");
    };
    window.addEventListener("api:unauthorized", onUnauthorized);
    return () => window.removeEventListener("api:unauthorized", onUnauthorized);
  }, [locale]);

  return (
    <SWRConfig value={{ onError: reportLoadError, errorRetryCount: 2 }}>
      {children}
      <AuthModal />
      <Toaster />
    </SWRConfig>
  );
}
