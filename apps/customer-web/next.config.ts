import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',  // generates ./out for wrangler static assets
  images: {
    unoptimized: true, // required for static export
  },
};

export default nextConfig;
