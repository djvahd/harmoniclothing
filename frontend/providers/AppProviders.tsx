"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import AuthModal from "@/components/auth/AuthModal";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <>
      {children}
      <AuthModal />
    </>
  );
}
