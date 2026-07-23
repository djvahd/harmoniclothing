import { apiFetch } from "@/lib/api";
import type { GenderSegment, PrintArea, Product } from "@/types/product";

interface Paginated<T> {
  data: T[];
  meta: { current_page: number; per_page: number; total: number };
}

export type ProductSort = "terbaru" | "harga_asc" | "harga_desc" | "terlaris" | "rating";

export interface GetProductsParams {
  categories?: string[];
  genders?: GenderSegment[];
  per_page?: number;
  price_min?: number;
  price_max?: number;
  sizes?: string[];
  colors?: string[];
  materials?: string[];
  print_areas?: PrintArea[];
  sort?: ProductSort;
}

function appendArrayParam(qs: URLSearchParams, key: string, values?: string[]) {
  values?.forEach((value) => qs.append(`${key}[]`, value));
}

export function getProducts(params?: GetProductsParams) {
  const qs = new URLSearchParams();
  appendArrayParam(qs, "categories", params?.categories);
  appendArrayParam(qs, "genders", params?.genders);
  appendArrayParam(qs, "sizes", params?.sizes);
  appendArrayParam(qs, "colors", params?.colors);
  appendArrayParam(qs, "materials", params?.materials);
  appendArrayParam(qs, "print_areas", params?.print_areas);
  if (params?.per_page) qs.set("per_page", String(params.per_page));
  if (params?.price_min != null) qs.set("price_min", String(params.price_min));
  if (params?.price_max != null) qs.set("price_max", String(params.price_max));
  if (params?.sort) qs.set("sort", params.sort);
  const query = qs.toString();
  return apiFetch<Paginated<Product>>(`/catalog/products${query ? `?${query}` : ""}`);
}

export interface CatalogFilterOptions {
  categories: { slug: string; name: string }[];
  genders: GenderSegment[];
  sizes: string[];
  colors: string[];
  materials: string[];
  print_areas: PrintArea[];
  price_min: number;
  price_max: number;
}

export function getCatalogFilters() {
  return apiFetch<{ data: CatalogFilterOptions }>("/catalog/products/filters");
}

export function getProductBySlug(slug: string) {
  return apiFetch<{ data: Product }>(`/catalog/products/${slug}`);
}
