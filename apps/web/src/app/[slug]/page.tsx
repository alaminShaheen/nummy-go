import VendorStorefront from '@/components/VendorStorefront';

/**
 * `dynamicParams = false` is required by `output: 'export'` (Cloudflare build)
 * because static export can't render unknown slugs at request time.
 * We pre-render a single placeholder ("_"); the Cloudflare worker serves it
 * as a fallback for any real vendor slug.
 *
 * In dev mode (SSR, NEXT_EXPORT not set), dynamicParams must be TRUE so that
 * Next.js renders any slug on-demand instead of 404-ing.
 */
export const dynamicParams = process.env.NEXT_EXPORT !== 'true';

export async function generateStaticParams() {
  // In static export mode, pre-render a placeholder.
  // In dev mode this is ignored (dynamicParams = true handles all slugs).
  return [{ slug: '_' }];
}

export default function VendorPage() {
  return <VendorStorefront />;
}
