import VendorStorefront from '@/components/VendorStorefront';

/**
 * In static export mode (Cloudflare deployment), Next.js requires all dynamic
 * routes to declare their params upfront via generateStaticParams.
 * We pre-render a single placeholder ("_"); Cloudflare's worker/index.ts
 * serves it as a fallback for any real vendor slug that hits a 404.
 *
 * In dev mode (SSR), these exports are simply ignored.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ slug: '_' }];
}

export default function VendorPage() {
  return <VendorStorefront />;
}
