import type { NextConfig } from 'next';

/**
 * `output: 'export'` is ONLY needed for the Cloudflare static deployment
 * (`wrangler deploy` reads from ./out/). During local dev, it causes
 * middleware to break and the root route to 404.
 *
 * Set NEXT_EXPORT=true in CI / the deploy script to enable it.
 * In dev (`pnpm dev`) it is off by default.
 */
const isExport = process.env.NEXT_EXPORT === 'true';

const nextConfig: NextConfig = {
  ...(isExport && {
    output: 'export',
    trailingSlash: true,
  }),
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@nummygo/shared'],
};

export default nextConfig;
