import { useEffect } from "react";
import useSWR, { mutate } from "swr";
import { getNotifications } from "@/services/notifications";
import { swrKeys } from "@/lib/swr-keys";
import { getEcho } from "@/lib/echo";
import { toast } from "@/store/toast-store";

/** Notifications shared by SiteHeader's bell dropdown and the full notifications page. */
export function useNotifications(enabled = true) {
  const { data, isLoading, error } = useSWR(enabled ? swrKeys.notifications() : null, getNotifications);
  return { notifications: data?.data ?? [], isLoading, error };
}

/** Revalidates the shared notifications cache after marking (all) read, wherever it happened. */
export function invalidateNotifications() {
  return mutate(swrKeys.notifications());
}

/**
 * FE-037: subscribes once (call from AppShell, not per-component — one Echo
 * channel per user, not one per consumer of useNotifications) to the private
 * channel NotificationCreated broadcasts on (routes/channels.php).
 */
export function useRealtimeNotifications(userId: number | undefined) {
  useEffect(() => {
    if (!userId) return;

    const channelName = `App.Models.User.${userId}`;
    const channel = getEcho().private(channelName);
    channel.listen(".notification.created", (payload: { title: string }) => {
      invalidateNotifications();
      toast(payload.title, "info");
    });

    return () => {
      getEcho().leave(channelName);
    };
  }, [userId]);
}
