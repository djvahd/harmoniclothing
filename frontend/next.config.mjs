import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      // R2 bucket's public "Public Development URL" domain (pub-<id>.r2.dev)
      // — different from the r2.cloudflarestorage.com S3 API endpoint above.
      { protocol: "https", hostname: "**.r2.dev" },
      // storageUrl() builds local-disk image URLs from API_URL (the site's own
      // origin, proxied to the backend via the /storage/* rewrite below).
      // Prod images normally come from R2 (**.r2.dev above); these cover the
      // local-disk fallback. Add any new public domain the site is served on.
      { protocol: "https", hostname: "harmoniclothing.com" },
      { protocol: "https", hostname: "api.harmoniclothing.com" },
    ],
  },
  // One canonical host: www -> apex (keeps path and query).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.harmoniclothing.com" }],
        destination: "https://harmoniclothing.com/:path*",
        permanent: true,
      },
    ];
  },
  // Same-origin proxy to the Laravel backend so Sanctum's session/CSRF cookies
  // stay first-party (replaces netlify.toml's redirects). Only active when
  // BACKEND_ORIGIN is set at build time (.env.production); local `pnpm dev`
  // talks to NEXT_PUBLIC_API_URL directly and needs none of this.
  async rewrites() {
    const origin = process.env.BACKEND_ORIGIN;
    if (!origin) return [];
    return ["api", "sanctum", "broadcasting", "storage"].map((p) => ({
      source: `/${p}/:path*`,
      destination: `${origin}/${p}/:path*`,
    }));
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
