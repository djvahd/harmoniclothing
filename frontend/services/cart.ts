import { apiFetch } from "@/lib/api";
import type { CartItem } from "@/types/product";

export function getCart() {
  return apiFetch<{ data: CartItem[] }>("/cart");
}

export function addToCart(payload: {
  product_variant_id: number;
  design_id?: number;
  quantity: number;
  notes?: string;
  design_position?: Record<string, unknown>;
  custom_design_file_path?: string;
}) {
  return apiFetch<{ data: CartItem }>("/cart", { method: "POST", body: payload });
}

export function updateCartItem(id: number, quantity: number) {
  return apiFetch<{ data: CartItem }>(`/cart/${id}`, {
    method: "PATCH",
    body: { quantity },
  });
}

export function removeCartItem(id: number) {
  return apiFetch<{ data: null }>(`/cart/${id}`, { method: "DELETE" });
}
