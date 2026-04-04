import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@nummygo/shared'],
  trailingSlash: true,
};

export default nextConfig;
