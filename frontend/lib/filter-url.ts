import { EMPTY_FILTER_VALUE, type FilterSidebarValue } from "@/components/ui/FilterSidebar";
import type { GenderSegment } from "@/types/product";

/** Query-string keys for list filters, so a filtered catalog/marketplace can be refreshed or shared as a URL. */
const LIST_KEYS = {
  categories: "kategori",
  genders: "segmen",
  sizes: "ukuran",
  colors: "warna",
  materials: "material",
  tags: "tag",
} as const;
const PRICE_MIN = "harga_min";
const PRICE_MAX = "harga_max";
export const SORT_KEY = "urut";
export const SEARCH_KEY = "q";
/** Fired by the header search when the catalog is already open, so its list updates without a navigation. */
export const HEADER_SEARCH_EVENT = "harmoni:header-search";

function list(sp: URLSearchParams, key: string): string[] {
  const raw = sp.get(key);
  return raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

/** Numeric price bounds for the API; a reversed range (min > max) is swapped so the request never 422s. */
export function normalizePriceRange(min: string, max: string): { min?: number; max?: number } {
  const lo = min ? Number(min) : undefined;
  const hi = max ? Number(max) : undefined;
  return lo !== undefined && hi !== undefined && lo > hi ? { min: hi, max: lo } : { min: lo, max: hi };
}

export function filtersFromParams(sp: URLSearchParams): FilterSidebarValue {
  return {
    ...EMPTY_FILTER_VALUE,
    categories: list(sp, LIST_KEYS.categories),
    genders: list(sp, LIST_KEYS.genders) as GenderSegment[],
    sizes: list(sp, LIST_KEYS.sizes),
    colors: list(sp, LIST_KEYS.colors),
    materials: list(sp, LIST_KEYS.materials),
    tags: list(sp, LIST_KEYS.tags),
    priceMin: sp.get(PRICE_MIN) ?? "",
    priceMax: sp.get(PRICE_MAX) ?? "",
  };
}

/**
 * Mirrors the filters (plus optional extras such as sort/search) into the address bar without
 * navigating or re-rendering; other params (e.g. ?tab=creator) are left alone.
 */
export function syncFiltersToUrl(filters: FilterSidebarValue, extras: Record<string, string | undefined> = {}) {
  const url = new URL(window.location.href);
  const p = url.searchParams;
  (Object.keys(LIST_KEYS) as (keyof typeof LIST_KEYS)[]).forEach((k) => {
    const values = filters[k] as string[];
    if (values.length) p.set(LIST_KEYS[k], values.join(","));
    else p.delete(LIST_KEYS[k]);
  });
  if (filters.priceMin) p.set(PRICE_MIN, filters.priceMin);
  else p.delete(PRICE_MIN);
  if (filters.priceMax) p.set(PRICE_MAX, filters.priceMax);
  else p.delete(PRICE_MAX);
  Object.entries(extras).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
  const next = url.pathname + (p.toString() ? `?${p.toString()}` : "") + url.hash;
  if (next !== window.location.pathname + window.location.search + window.location.hash) {
    window.history.replaceState(window.history.state, "", next);
  }
}
