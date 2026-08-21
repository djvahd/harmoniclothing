import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      // storageUrl() builds image URLs from NEXT_PUBLIC_API_URL, which in
      // production is this same Netlify domain (proxied to Railway via
      // netlify.toml's /storage/* redirect) — update this alongside
      // NEXT_PUBLIC_API_URL if the temporary .netlify.app domain is ever
      // swapped for a real custom domain (see DEPLOYMENT.md).
      { protocol: "https", hostname: "harmoniclothing.netlify.app" },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
