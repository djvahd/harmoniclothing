/** Public product catalog: filtered/sorted listing, filter facets, and detail-by-slug. */
import { apiFetch } from "@/lib/api";
import { buildQuery } from "@/lib/query";
import type { GenderSegment, PrintArea, Product, Review } from "@/types/product";
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

/** Page size of the public catalog; shared by the server-rendered first page and the client list. */
export const CATALOG_PER_PAGE = 40;

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

/** Review count per star ("5" down to "1"), returned in `meta` by the product reviews endpoint. */
export type RatingDistribution = Record<string, number>;

export type ProductReviewsResponse = Omit<Paginated<Review>, "meta"> & {
  meta: Paginated<Review>["meta"] & { rating_distribution?: RatingDistribution };
};

export function getProductReviews(slug: string, params?: { page?: number; per_page?: number }) {
  return apiFetch<ProductReviewsResponse>(`/catalog/products/${slug}/reviews${buildQuery(params)}`);
}
