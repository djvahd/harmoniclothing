import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/creator", "/account", "/cart", "/checkout", "/api"],
    },
    sitemap: "https://harmoniclothing.com/sitemap.xml",
  };
}
