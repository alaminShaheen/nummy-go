import VendorStorefront from '@/components/VendorStorefront';
import { Tenant } from '@nummygo/shared/models';
import { serverTRPC } from '@/trpc/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

/**
 * ISR – serve a cached page shell and revalidate in the background.
 * The client-side TRPC queries inside VendorStorefrontContent will
 * always refetch fresh data after hydration, so customers still see
 * live menu/availability changes. The 60-second window keeps the
 * server-rendered HTML fresh enough for SEO crawlers and first paint
 * without hitting the DB on every single request.
 */
export const revalidate = 60;



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
