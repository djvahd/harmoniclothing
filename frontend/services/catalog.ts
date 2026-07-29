/** Public product catalog: filtered/sorted listing, filter facets, and detail-by-slug. */
import { apiFetch } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { GenderSegment, PrintArea, Product } from "@/types/product";
import type { Paginated } from "@/types/api";

export type ProductSort = "terbaru" | "harga_asc" | "harga_desc" | "terlaris" | "rating";

export interface GetProductsParams {
  categories?: string[];
  genders?: GenderSegment[];
  page?: number;
  per_page?: number;
  price_min?: number;
  price_max?: number;
  sizes?: string[];
  colors?: string[];
  materials?: string[];
  print_areas?: PrintArea[];
  sort?: ProductSort;
}

export function getProducts(params?: GetProductsParams) {
  return apiFetch<Paginated<Product>>(`/catalog/products${buildQuery(params)}`);
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
