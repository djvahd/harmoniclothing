/** The signed-in customer's wishlist: list, add (product or design), remove. */
import { apiFetch } from "@/lib/api";
import type { WishlistItem } from "@/types/wishlist";

export function getWishlist() {
  return apiFetch<{ data: WishlistItem[] }>("/wishlist");
}

export function addToWishlist(payload: { product_id?: number; design_id?: number }) {
  return apiFetch<{ data: WishlistItem }>("/wishlist", { method: "POST", body: payload });
}

export function removeFromWishlist(id: number) {
  return apiFetch<{ data: null }>(`/wishlist/${id}`, { method: "DELETE" });
}
