/** The signed-in customer's orders: list/detail, cancel, reorder, confirm-received, invoice, and review submission. */
import { apiFetch } from "@/lib/api";
import type { Order } from "@/types/order";
import type { Invoice } from "@/types/wishlist";

export function getOrders() {
  return apiFetch<{ data: Order[] }>("/orders");
}

export function getOrder(id: number) {
  return apiFetch<{ data: Order }>(`/orders/${id}`);
}

export function cancelOrder(id: number) {
  return apiFetch<{ data: Order }>(`/orders/${id}/cancel`, { method: "POST" });
}

/** Resume paying an unpaid order; returns the Snap URL saved at checkout (null until Midtrans is configured). */
export function payOrder(id: number) {
  return apiFetch<{ data: { midtrans_redirect_url: string | null } }>(`/orders/${id}/pay`, { method: "POST" });
}

export function reorder(id: number) {
  return apiFetch<{ data: null }>(`/orders/${id}/reorder`, { method: "POST" });
}

export function confirmReceived(id: number) {
  return apiFetch<{ data: Order }>(`/orders/${id}/confirm-received`, { method: "POST" });
}

export function getInvoice(orderId: number) {
  return apiFetch<{ data: Invoice }>(`/orders/${orderId}/invoice`);
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
