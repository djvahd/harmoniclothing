import { apiFetch } from "@/lib/api";
import type { Design } from "@/types/product";

interface Paginated<T> {
  data: T[];
  meta: { current_page: number; per_page: number; total: number };
}

export type DesignSort = "terbaru" | "harga_asc" | "harga_desc" | "terlaris" | "rating";

export interface GetDesignsParams {
  categories?: string[];
  product_categories?: string[];
  tags?: string[];
  search?: string;
  price_min?: number;
  price_max?: number;
  sort?: DesignSort;
  page?: number;
  per_page?: number;
}

function appendArrayParam(qs: URLSearchParams, key: string, values?: string[]) {
  values?.forEach((value) => qs.append(`${key}[]`, value));
}

export function getDesigns(params?: GetDesignsParams) {
  const qs = new URLSearchParams();
  appendArrayParam(qs, "categories", params?.categories);
  appendArrayParam(qs, "product_categories", params?.product_categories);
  appendArrayParam(qs, "tags", params?.tags);
  if (params?.search) qs.set("search", params.search);
  if (params?.price_min != null) qs.set("price_min", String(params.price_min));
  if (params?.price_max != null) qs.set("price_max", String(params.price_max));
  if (params?.sort) qs.set("sort", params.sort);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.per_page) qs.set("per_page", String(params.per_page));
  const query = qs.toString();
  return apiFetch<Paginated<Design>>(`/marketplace/designs${query ? `?${query}` : ""}`);
}

export interface DesignFilterOptions {
  categories: { slug: string; name: string }[];
  product_categories: { slug: string; name: string }[];
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
  sort?: CreatorSort;
  page?: number;
  per_page?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  appendArrayParam(qs, "categories", params?.categories);
  if (params?.sort) qs.set("sort", params.sort);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.per_page) qs.set("per_page", String(params.per_page));
  const query = qs.toString();
  return apiFetch<Paginated<CreatorSummary>>(`/marketplace/creators${query ? `?${query}` : ""}`);
}

export function getCreatorBySlug(slug: string) {
  return apiFetch<{ data: CreatorProfile }>(`/marketplace/creators/${slug}`);
}
