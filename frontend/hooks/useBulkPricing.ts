import useSWR from "swr";
import { getBulkPricingTiers } from "@/services/checkout";
import { swrKeys } from "@/lib/swr-keys";

/** BR-012 tiers (min_qty/max_qty/price_per_unit), ordered ascending — used to preview Bulk Order pricing before checkout. */
export function useBulkPricingTiers() {
  const { data, isLoading, error } = useSWR(swrKeys.bulkPricingTiers(), getBulkPricingTiers);
  return { tiers: data?.data ?? [], isLoading, error };
}

/** Mirrors backend PricingService::bulkUnitPriceFor() — the tier whose [min_qty, max_qty] range contains totalQuantity. */
export function findBulkTier(
  tiers: { min_qty: number; max_qty: number | null; price_per_unit: number }[],
  totalQuantity: number,
) {
  if (totalQuantity <= 0) return null;
  return (
    tiers.find(
      (t) => totalQuantity >= t.min_qty && (t.max_qty === null || totalQuantity <= t.max_qty),
    ) ?? null
  );
}
