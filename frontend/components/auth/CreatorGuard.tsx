"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { getCreatorDashboard } from "@/services/creator";
import { ApiError } from "@/lib/api";

/**
 * /creator/verification submits the KYC that *makes* a creator active — it
 * must stay reachable before that's true, or nobody could ever finish
 * onboarding, so it's exempt from the creator.active probe below.
 */
const EXEMPT_PATHS = ["/creator/verification"];

export default function CreatorGuard({ children }: { children: React.ReactNode }) {
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
  // Only an explicit 403 means "not an active creator"; a 5xx/network failure must not bounce a creator away.
  const isForbidden = error instanceof ApiError && error.status === 403;
  const checked = exempt || Boolean(data) || Boolean(error);

  useEffect(() => {
    if (authStatus !== "ready") return;

    if (!user) {
      if (!useAuthModalStore.getState().view) openAuthModal("login");
      return;
    }

    if (!exempt && isForbidden) {
      router.replace("/account/become-creator");
    }
  }, [authStatus, user, exempt, isForbidden, router, openAuthModal]);

  if (!authReady || !checked || (!exempt && isForbidden)) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-text-secondary" />
      </div>
    );
  }

  return <>{children}</>;
}
