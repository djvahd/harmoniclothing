import useSWR, { mutate } from "swr";
import { getNotifications } from "@/services/notifications";
import { swrKeys } from "@/lib/swr-keys";

/** Notifications shared by SiteHeader's bell dropdown and the full notifications page. */
export function useNotifications(enabled = true) {
  const { data, isLoading, error } = useSWR(enabled ? swrKeys.notifications() : null, getNotifications);
  return { notifications: data?.data ?? [], isLoading, error };
}

/** Revalidates the shared notifications cache after marking (all) read, wherever it happened. */
export function invalidateNotifications() {
  return mutate(swrKeys.notifications());
}
