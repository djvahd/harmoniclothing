import type { MetadataRoute } from "next";
import { fetchPublic } from "@/lib/server-fetch";

const BASE_URL = "https://harmoniclothing.com";

const ROUTES = [
  "",
  "/catalog",
  "/marketplace",
  "/about",
  "/faq",
  "/pusat-bantuan",
  "/kontak",
  "/legal/terms",
  "/legal/privacy-policy",
  "/legal/returns",
  "/legal/shipping",
];

// Rebuilt at most hourly so new products/designs show up without a deploy.
export const revalidate = 3600;

type SlugList = { data: { slug: string }[] } | null;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // If the API is unreachable the static pages are still listed.
  const [products, designs] = await Promise.all([
    fetchPublic<SlugList>("/catalog/products?per_page=100"),
    fetchPublic<SlugList>("/marketplace/designs?per_page=100"),
  ]);

  return [
    ...ROUTES.map((route) => ({ url: `${BASE_URL}${route}` })),
    ...(products?.data ?? []).map((p) => ({ url: `${BASE_URL}/catalog/${p.slug}` })),
    ...(designs?.data ?? []).map((d) => ({ url: `${BASE_URL}/marketplace/design/${d.slug}` })),
  ];
}
