import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

/** Shared confirm -> logout -> redirect-to-home flow for every logout trigger in the app. */
export function useLogoutConfirm() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  function requestLogout() {
    setConfirmOpen(true);
  }

  function cancelLogout() {
    setConfirmOpen(false);
  }

  async function confirmLogout() {
    setConfirmOpen(false);
    router.push("/");
    await logout();
  }

  return { confirmOpen, requestLogout, cancelLogout, confirmLogout };
}
