/** Regular (non-bulk) checkout: turns selected cart items + an address into an order. */
import { apiFetch } from "@/lib/api";
import type { Order } from "@/types/order";

interface CheckoutPayload {
  address_id: number;
  cart_item_ids: number[];
  notes?: string;
}

export function checkout(payload: CheckoutPayload) {
  return apiFetch<{ data: Order }>("/checkout", { method: "POST", body: payload });
}
