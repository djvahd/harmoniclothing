import type { GetProductsParams } from "@/services/catalog";
import type { GetDesignsParams, CreatorSort } from "@/services/marketplace";

export interface GetCreatorsParams {
  search?: string;
  categories?: string[];
  tags?: string[];
  sort?: CreatorSort;
  page?: number;
  per_page?: number;
}

/**
 * Every SWR cache key shared by more than one file lives here. A resource
 * fetched in one component and invalidated via `mutate()` in another must
 * use the same key builder on both sides — hand-typing the string twice is
 * how those two sides silently drift apart.
 */
export const swrKeys = {
  cart: () => "/cart" as const,
  adminProducts: () => "/admin/catalog/products" as const,
  adminCreators: (status: "aktif" | "banned") => ["/admin/creators", status] as const,
  wishlist: () => "/wishlist" as const,
  notifications: () => "/notifications" as const,
  orders: () => "/orders" as const,
  order: (id: number) => `/orders/${id}` as const,
  orderInvoice: (id: number) => `/orders/${id}/invoice` as const,

  // `tag` disambiguates the many differently-scoped product lists (public
  // catalog, admin catalog, home page teaser, creator upload picker,
  // "you might like") that would otherwise collide on the same base path.
  products: (tag: string, params?: GetProductsParams) => ["/catalog/products", tag, params] as const,
  productBySlug: (slug: string) => `/catalog/products/${slug}` as const,
  productFilters: () => "/catalog/products/filters" as const,
  productReviews: (slug: string, page: number) => ["/catalog/products", slug, "reviews", page] as const,

  designs: (tag: string, params?: GetDesignsParams) => ["/marketplace/designs", tag, params] as const,
  designBySlug: (slug: string) => `/marketplace/designs/${slug}` as const,
  designFilters: () => "/marketplace/designs/filters" as const,
  designReviews: (slug: string, page: number) => ["/marketplace/designs", slug, "reviews", page] as const,

  creators: (tag: string, params?: GetCreatorsParams) => ["/marketplace/creators", tag, params] as const,
  creatorBySlug: (slug: string) => `/marketplace/creators/${slug}` as const,

  bulkPricingTiers: () => "/bulk-pricing-tiers" as const,
};
