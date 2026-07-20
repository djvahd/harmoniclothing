import { apiFetch } from "@/lib/api";
import type { Product } from "@/types/product";

interface Paginated<T> {
  data: T[];
  meta: { current_page: number; per_page: number; total: number };
}

export function getProducts(params?: { category?: string; per_page?: number }) {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.per_page) qs.set("per_page", String(params.per_page));
  const query = qs.toString();
  return apiFetch<Paginated<Product>>(`/catalog/products${query ? `?${query}` : ""}`);
}

export function getProductBySlug(slug: string) {
  return apiFetch<{ data: Product }>(`/catalog/products/${slug}`);
}

export interface BulkPricingTier {
  min_qty: number;
  max_qty: number | null;
  price_per_unit: number;
}

export function getBulkPricingTiers() {
  return apiFetch<{ data: BulkPricingTier[] }>("/bulk-pricing-tiers");
}
