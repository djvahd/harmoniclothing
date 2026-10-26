import useSWR from "swr";
import { getVerificationStatus } from "@/services/creator";

/** The signed-in user's own creator application, shared (same SWR key) with the verification page. Pass false to skip fetching. */
export function useCreatorApplication(enabled = true) {
  const { data } = useSWR(enabled ? "/creator/verification" : null, getVerificationStatus);
  return { applied: data?.data.applied ?? false, status: data?.data.status ?? null };
}

/** Where the account menu's creator entry points to, and which label key it uses, for the given application state. */
export function creatorEntry(applied: boolean, status: string | null) {
  if (!applied) return { href: "/account/become-creator", key: "becomeCreator" } as const;
  if (status === "aktif") return { href: "/creator/dashboard", key: "creatorDashboard" } as const;
  return { href: "/creator/verification", key: "creatorStatus" } as const;
}
