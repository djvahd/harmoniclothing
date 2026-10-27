import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CatalogListClient from "./CatalogListClient";
import { CATALOG_PER_PAGE } from "@/services/catalog";
import { fetchPublic } from "@/lib/server-fetch";
import type { Paginated } from "@/types/api";
import type { Product } from "@/types/product";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("public.catalogList.meta");
  return { title: t("title"), description: t("description") };
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // Render the default first page on the server so the product grid is in the HTML (SEO, no-JS).
  // A link with filters/sort/search in the URL is rendered by the client as before.
  const hasQuery = Object.keys(await searchParams).length > 0;
  const initial = hasQuery
    ? null
    : await fetchPublic<Paginated<Product>>(`/catalog/products?page=1&per_page=${CATALOG_PER_PAGE}&sort=terbaru`);

  return <CatalogListClient initial={initial ?? undefined} />;
}
