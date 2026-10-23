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

/**
 * The Snap popup reports success before Midtrans' webhook has flipped the order
 * out of "belum_dibayar", so re-fetch a few times until it has (or give up).
 */
export async function refreshAfterPayment(id: number) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await mutate(swrKeys.order(id));
    if (res?.data?.status && res.data.status !== "belum_dibayar") return;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
