import VendorStorefront from '@/components/VendorStorefront';

/**
 * generateStaticParams is required when `output: 'export'` is active
 * (Cloudflare build). We pre-render a placeholder slug ("_"); Cloudflare's
 * worker/index.ts serves it as a fallback for any real vendor slug.
 *
 * `dynamicParams` is intentionally NOT set here:
 *  - In export/deploy mode  → only generateStaticParams results are built;
 *    there is no server at runtime so the value is irrelevant.
 *  - In dev/SSR mode        → defaults to `true`, meaning every slug is
 *    rendered on-demand without a 404.
 *
 * NOTE: Next.js requires segment config exports (dynamicParams, revalidate,
 * etc.) to be **static literals**. Using a runtime expression like
 * `process.env.X !== 'y'` causes a build error — so we simply omit it.
 */
export async function generateStaticParams() {
  return [{ slug: '_' }];
}

export default function VendorPage() {
  return <VendorStorefront />;
}
