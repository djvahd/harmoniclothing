import useSWR, { mutate } from "swr";
import { getOrder, getOrders } from "@/services/orders";
import { swrKeys } from "@/lib/swr-keys";

/** The current customer's order list (account/orders). */
export function useOrders() {
  const { data, isLoading, error } = useSWR(swrKeys.orders(), getOrders);
  return { orders: data?.data ?? [], isLoading, error };
}

/** A single order's detail (account/orders/[id]). */
export function useOrder(id: number) {
  const { data, isLoading, error } = useSWR(swrKeys.order(id), () => getOrder(id));
  return { order: data?.data, isLoading, error };
}

/** Revalidates one order's detail cache after cancel/confirm-received, wherever it happened. */
export function invalidateOrder(id: number) {
  return mutate(swrKeys.order(id));
}
