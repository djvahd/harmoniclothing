import useSWR, { mutate } from "swr";
import { getWishlist } from "@/services/wishlist";
import { swrKeys } from "@/lib/swr-keys";

/** Wishlist items shared by WishlistButton (product/design cards) and the account wishlist page. */
export function useWishlist(enabled = true) {
  const { data, isLoading, error } = useSWR(enabled ? swrKeys.wishlist() : null, getWishlist);
  return { items: data?.data ?? [], isLoading, error };
}

/** Revalidates the shared wishlist cache after add/remove, wherever it happened. */
export function invalidateWishlist() {
  return mutate(swrKeys.wishlist());
}
