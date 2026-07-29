import useSWR, { mutate } from "swr";
import { getCart } from "@/services/cart";
import { swrKeys } from "@/lib/swr-keys";

/** Cart items shared by SiteHeader, the cart page, and checkout. Pass `enabled=false` to skip the fetch for guests. */
export function useCart(enabled = true) {
  const { data, isLoading, error } = useSWR(enabled ? swrKeys.cart() : null, getCart);
  return { items: data?.data ?? [], isLoading, error };
}

/** Revalidates the shared cart cache after any mutation (add/update/remove), wherever it happened. */
export function invalidateCart() {
  return mutate(swrKeys.cart());
}
