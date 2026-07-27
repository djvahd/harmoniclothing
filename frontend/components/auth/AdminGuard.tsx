"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useAuthModalStore } from "@/store/auth-modal-store";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const openAuthModal = useAuthModalStore((state) => state.open);
  const router = useRouter();

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (status !== "ready") return;

    if (!user) {
      router.replace("/");
      openAuthModal("login", "Silakan masuk sebagai admin untuk mengakses halaman ini.");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [status, user, isAdmin, router, openAuthModal]);

  if (status !== "ready" || !isAdmin) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-text-secondary" />
      </div>
    );
  }

  return <>{children}</>;
}
