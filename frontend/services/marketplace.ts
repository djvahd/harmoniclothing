import { apiFetch } from "@/lib/api";
import type { Design } from "@/types/product";

interface Paginated<T> {
  data: T[];
  meta: { current_page: number; per_page: number; total: number };
}

export interface CreatorProfile {
  name: string;
  slug: string;
  since: string | null;
  designs: Design[];
}

export function getDesigns(params?: { category?: string; search?: string; per_page?: number }) {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.search) qs.set("search", params.search);
  if (params?.per_page) qs.set("per_page", String(params.per_page));
  const query = qs.toString();
  return apiFetch<Paginated<Design>>(`/marketplace/designs${query ? `?${query}` : ""}`);
}

export function getDesignBySlug(slug: string) {
  return apiFetch<{ data: Design }>(`/marketplace/designs/${slug}`);
}

export function getCreatorBySlug(slug: string) {
  return apiFetch<{ data: CreatorProfile }>(`/marketplace/creators/${slug}`);
}
