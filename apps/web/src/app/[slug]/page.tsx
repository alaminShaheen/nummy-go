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
        const slugs = await serverTRPC.tenant.allTenantSlugs.query();
        return slugs;
    } catch (error) {
        console.error('Error in generateStaticParams:', (error as any)?.data);
        return [{ slug: '_' }]; // Fallback placeholder
    }
}

export default async function VendorPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let tenant = null;
    let initialMenu: any[] = [];
    let initialCategories: any[] = [];

    try {
        tenant = await serverTRPC.tenant.getTenantBySlug.query({ slug });
        if (tenant) {
            initialMenu = await serverTRPC.menu.getStorefrontMenu.query({ tenantId: tenant.id });
            initialCategories = await serverTRPC.category.getStorefrontCategories.query({ tenantId: tenant.id });
        }
    } catch (error) {
        console.error('Failed to fetch storefront data:', error);
    }

    if (!tenant) {
        notFound();
    }

    return (
        <VendorStorefront
            tenant={tenant as unknown as Tenant}
            initialMenu={initialMenu}
            initialCategories={initialCategories}
        />
    );
}
