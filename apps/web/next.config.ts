import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@nummygo/shared'],
};

export default nextConfig;
