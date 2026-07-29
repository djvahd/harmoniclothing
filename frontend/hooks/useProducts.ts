import useSWR from "swr";
import { getCatalogFilters, getProductBySlug, getProducts, type GetProductsParams } from "@/services/catalog";
import { swrKeys } from "@/lib/swr-keys";

/** A product list for a given usage site — pass a stable `tag` (e.g. "public", "admin", "home") so unrelated lists don't share a cache entry. */
export function useProducts(tag: string, params?: GetProductsParams) {
  const { data, isLoading, error } = useSWR(swrKeys.products(tag, params), () => getProducts(params));
  return { data, isLoading, error };
}

/** A single product's detail, by slug (catalog/[slug], customize/[slug]). */
export function useProduct(slug: string | null) {
  const { data, isLoading, error } = useSWR(slug ? swrKeys.productBySlug(slug) : null, () =>
    getProductBySlug(slug as string),
  );
  return { product: data?.data, isLoading, error };
}

/** Catalog-wide filter facets (categories/sizes/colors/materials/price range). */
export function useProductFilters() {
  const { data } = useSWR(swrKeys.productFilters(), getCatalogFilters);
  return data?.data;
}
