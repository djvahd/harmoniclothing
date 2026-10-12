import type { MetadataRoute } from "next";

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

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({ url: `${BASE_URL}${route}` }));
}
