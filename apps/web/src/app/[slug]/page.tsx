import VendorStorefront from '@/components/VendorStorefront';
import { Tenant } from '@nummygo/shared/models';
import { serverTRPC } from '@/trpc/server';
import { notFound } from 'next/navigation';

/**
 * ISR Configuration for Cloudflare Pages (via OpenNext)
 *
 * - generateStaticParams: Pre-generates pages for existing vendors at build time
 * - revalidate: Regenerates pages every hour (3600 seconds)
 * - dynamicParams: Allows new vendor slugs not in generateStaticParams to be
 *   generated on-demand when first requested
 */

// Revalidate pages every hour (ISR)
export const revalidate = 3600;

// Allow dynamic slugs that weren't pre-generated
export const dynamicParams = true;

// Pre-generate pages for existing vendors at build time
export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_WORKER_URL || 'http://localhost:8787';

    // Fetch all vendor slugs from your API
    // const response = await fetch(`${apiUrl}/api/vendors`, {
    //   next: { revalidate: 3600 } // Cache vendor list for 1 hour during build
    // });

    // if (!response.ok) {
    //   console.warn('Failed to fetch vendors for generateStaticParams, using fallback');
    //   return [{ slug: '_' }]; // Fallback placeholder
    // }

    // const vendors = await response.json();

    // Return array of slug params
    // return vendors.map((vendor: { slug: string }) => ({
    //   slug: vendor.slug,
    // }));
    return [{ slug: "hot-pretzel-9012" }, { slug: "hot-chicken-9012" }, { slug: "hot-pizza-9012" }]
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [{ slug: '_' }]; // Fallback placeholder
  }
}

export default async function VendorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let tenant = null;
  try {
    tenant = await serverTRPC.tenant.getTenantBySlug.query({ slug });
  } catch (error) {
    console.error('Failed to fetch tenant:', error);
  }

  if (!tenant) {
    notFound();
  }

  return <VendorStorefront tenant={tenant as unknown as Tenant} />;
}
