/** The signed-in customer's in-app notifications: list and mark-as-read. */
import { apiFetch } from "@/lib/api";
import type { AppNotification } from "@/types/notification";

export function getNotifications() {
  return apiFetch<{ data: AppNotification[] }>("/notifications");
}

export function markNotificationRead(id: number) {
  return apiFetch<{ data: AppNotification }>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}
