import VendorStorefront from '@/components/VendorStorefront';
import { Tenant } from '@nummygo/shared/models';
import { serverTRPC } from '@/trpc/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

/**
 * Force dynamic rendering for storefront pages to ensure
 * live changes (menu availability, shop open/close, profile edits)
 * are immediately visible to customers and vendors.
 */
export const dynamic = 'force-dynamic';



export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    try {
        const tenant = await serverTRPC.tenant.getTenantBySlug.query({ slug });
        if (!tenant) return {};

        return {
            title: tenant.name,
            description: tenant.description || `Order ${tenant.name} online. Freshly prepared and ready for delivery/pickup.`,
            openGraph: {
                title: tenant.name,
                description: tenant.description || `Order ${tenant.name} online.`,
                images: tenant.heroImageUrl ? [{ url: tenant.heroImageUrl }] : undefined,
                siteName: 'nummyGo',
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: tenant.name,
                description: tenant.description || `Order ${tenant.name} online.`,
                images: tenant.heroImageUrl ? [tenant.heroImageUrl] : undefined,
            }
        };
    } catch {
        return {};
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
