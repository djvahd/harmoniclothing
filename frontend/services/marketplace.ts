import { apiFetch } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { Design } from "@/types/product";
import type { Paginated } from "@/types/api";

export type DesignSort = "terbaru" | "harga_asc" | "harga_desc" | "terlaris" | "rating";

export interface GetDesignsParams {
  categories?: string[];
  tags?: string[];
  search?: string;
  price_min?: number;
  price_max?: number;
  sort?: DesignSort;
  page?: number;
  per_page?: number;
}

export function getDesigns(params?: GetDesignsParams) {
  return apiFetch<Paginated<Design>>(`/marketplace/designs${buildQuery(params)}`);
}

export interface DesignFilterOptions {
  categories: { slug: string; name: string }[];
  popular_tags: { slug: string; name: string }[];
  price_min: number;
  price_max: number;
}

export function getDesignFilters() {
  return apiFetch<{ data: DesignFilterOptions }>("/marketplace/designs/filters");
}

export function getDesignBySlug(slug: string) {
  return apiFetch<{ data: Design }>(`/marketplace/designs/${slug}`);
}

export interface CreatorProfile {
  name: string;
  bio: string | null;
  portfolio_url: string | null;
  slug: string;
  since: string | null;
  designs: Design[];
}

export type CreatorSort = "terbaru" | "terlaris" | "rating";

export interface CreatorSummary {
  name: string;
  slug: string;
  bio: string | null;
  since: string | null;
  design_count: number;
  sold_count: number;
  rating_average: number | null;
  review_count: number;
}

export function getCreators(params?: {
  search?: string;
  categories?: string[];
  tags?: string[];
  sort?: CreatorSort;
  page?: number;
  per_page?: number;
}) {
  return apiFetch<Paginated<CreatorSummary>>(`/marketplace/creators${buildQuery(params)}`);
}

export function getCreatorBySlug(slug: string) {
  return apiFetch<{ data: CreatorProfile }>(`/marketplace/creators/${slug}`);
}
