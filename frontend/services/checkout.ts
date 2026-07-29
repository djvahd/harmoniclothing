/** Regular checkout + Bulk Order checkout (BR-026: two separate flows, never mixed) and the public bulk-pricing tier list. */
import { apiFetch } from "@/lib/api";
import type { BulkPricingTier, Order } from "@/types/order";

interface CheckoutPayload {
  address_id: number;
  cart_item_ids: number[];
  notes?: string;
}

export function checkout(payload: CheckoutPayload) {
  return apiFetch<{ data: Order }>("/checkout", { method: "POST", body: payload });
}

/** GET /bulk-pricing-tiers — BR-012, public, used to preview tiered pricing before checkout. */
export function getBulkPricingTiers() {
  return apiFetch<{ data: BulkPricingTier[] }>("/bulk-pricing-tiers");
}

interface BulkCheckoutPayload {
  address_id: number;
  items: { product_variant_id: number; quantity: number }[];
  design_id?: number;
  custom_design_file_path?: string;
  notes?: string;
}

/** POST /checkout/bulk — Flow 7, bypasses the cart entirely (BR-026). */
export function checkoutBulk(payload: BulkCheckoutPayload) {
  return apiFetch<{ data: Order }>("/checkout/bulk", { method: "POST", body: payload });
}
