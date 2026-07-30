"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth-store";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { getCreatorDashboard } from "@/services/creator";

/**
 * /creator/verification submits the KYC that *makes* a creator active — it
 * must stay reachable before that's true, or nobody could ever finish
 * onboarding, so it's exempt from the creator.active probe below.
 */
const EXEMPT_PATHS = ["/creator/verification"];

export default function CreatorGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth.guards");
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);
  const openAuthModal = useAuthModalStore((state) => state.open);
  const router = useRouter();
  const pathname = usePathname();
  const exempt = EXEMPT_PATHS.includes(pathname);
  const authReady = authStatus === "ready" && Boolean(user);

  // Reuses the dashboard page's own SWR key/fetcher so this probe doesn't
  // cost a second network round trip once the page itself renders.
  // creator.active is existence-based (BR-013), not a `role` value /me
  // exposes, so probing a creator.active-gated endpoint is the only way to
  // know from the client.
  const { data, error } = useSWR(!exempt && authReady ? "/creator/dashboard" : null, getCreatorDashboard);
  const isForbidden = Boolean(error);
  const checked = exempt || Boolean(data) || isForbidden;

  useEffect(() => {
    if (authStatus !== "ready") return;

    if (!user) {
      router.replace("/");
      openAuthModal("login", t("loginRequired"));
      return;
    }

    if (!exempt && isForbidden) {
      router.replace("/account/become-creator");
    }
  }, [authStatus, user, exempt, isForbidden, router, openAuthModal, t]);

  if (!authReady || !checked || (!exempt && isForbidden)) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-text-secondary" />
      </div>
    );
  }

  return <>{children}</>;
}
