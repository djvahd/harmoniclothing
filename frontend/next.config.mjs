/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    ],
  },
};

export default nextConfig;
