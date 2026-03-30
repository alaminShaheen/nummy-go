/**
 * apps/tenant-web/next.config.ts
 * Standard Next.js config for the tenant dashboard.
 */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Required for Cloudflare Pages deployment
  },
};

export default nextConfig;
