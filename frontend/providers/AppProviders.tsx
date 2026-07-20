"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return <>{children}</>;
}
