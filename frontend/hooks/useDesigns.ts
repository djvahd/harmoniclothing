import useSWR from "swr";
import {
  getDesignBySlug,
  getDesignFilters,
  getDesigns,
  type GetDesignsParams,
} from "@/services/marketplace";
import { swrKeys } from "@/lib/swr-keys";

/** A design list for a given usage site — pass a stable `tag` (e.g. "public", "home", "you-might-like") so unrelated lists don't share a cache entry. */
export function useDesigns(tag: string, params?: GetDesignsParams) {
  const { data, isLoading, error } = useSWR(swrKeys.designs(tag, params), () => getDesigns(params));
  return { data, isLoading, error };
}

/** A single design's detail, by slug (marketplace/design/[slug], customize/[slug]). */
export function useDesign(slug: string | null) {
  const { data, isLoading, error } = useSWR(slug ? swrKeys.designBySlug(slug) : null, () =>
    getDesignBySlug(slug as string),
  );
  return { design: data?.data, isLoading, error };
}

/** Marketplace-wide filter facets (categories/popular tags/price range). */
export function useDesignFilters() {
  const { data } = useSWR(swrKeys.designFilters(), getDesignFilters);
  return data?.data;
}
