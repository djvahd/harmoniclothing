import { apiFetch } from "@/lib/api";
import type { Order } from "@/types/order";

export function getOrders() {
  return apiFetch<{ data: Order[] }>("/orders");
}

export function getOrder(id: number) {
  return apiFetch<{ data: Order }>(`/orders/${id}`);
}

export function cancelOrder(id: number) {
  return apiFetch<{ data: Order }>(`/orders/${id}/cancel`, { method: "POST" });
}

export function reorder(id: number) {
  return apiFetch<{ data: null }>(`/orders/${id}/reorder`, { method: "POST" });
}

export function confirmReceived(id: number) {
  return apiFetch<{ data: Order }>(`/orders/${id}/confirm-received`, { method: "POST" });
}

export function submitReview(
  orderId: number,
  payload: { order_item_id: number; rating: number; comment?: string },
) {
  return apiFetch<{ data: null }>(`/orders/${orderId}/reviews`, {
    method: "POST",
    body: payload,
  });
}
