import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Cloudflare Pages configuration
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
