"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useAuthModalStore } from "@/store/auth-modal-store";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const openAuthModal = useAuthModalStore((state) => state.open);

  useEffect(() => {
    if (status !== "ready") return;

    if (!user) {
      openAuthModal("login");
    }
  }, [status, user, openAuthModal]);

  if (status !== "ready" || !user) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-text-secondary" />
      </div>
    );
  }

  return <>{children}</>;
}
