import type { NextConfig } from 'next';

/**
 * OpenNext configuration for Cloudflare Pages deployment
 * No need for 'output: export' - OpenNext handles the build
 * Middleware and ISR now work properly
 */
const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Required for Cloudflare Pages
  },
  transpilePackages: ['@nummygo/shared'],
};

export default nextConfig;
