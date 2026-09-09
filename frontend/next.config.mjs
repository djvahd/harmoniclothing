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
      // origin, proxied to Railway via netlify.toml's /storage/* redirect).
      // Prod images normally come from R2 (**.r2.dev above); these cover the
      // local-disk fallback. Add any new public domain the site is served on.
      { protocol: "https", hostname: "harmoniclothing.com" },
      { protocol: "https", hostname: "harmoniclothing.netlify.app" },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
