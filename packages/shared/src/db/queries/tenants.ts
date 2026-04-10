import { eq , like, and, inArray} from 'drizzle-orm';
import { getDb } from '../client';
import { tenants } from '../schema';
import type { CreateTenantRecordDto, Tenant, UpdateTenantDto } from '../../models';

export async function createTenant(data: CreateTenantRecordDto) {
	const result = await getDb().insert(tenants).values(data).returning();
	const row = result[0];
	if (!row) throw new Error('Insert returned no rows');
	return row;
}

export async function getTenantById(id: string) {
	const rows = await getDb().select().from(tenants).where(eq(tenants.id, id)).limit(1);
	return rows[0];
}

export async function getTenantsByIds(ids: string[]) {
	if (ids.length === 0) return [];
	return getDb().select().from(tenants).where(inArray(tenants.id, ids));
}

export async function getTenantByUserId(userId: string): Promise<Tenant> {
	const rows = await getDb().select().from(tenants).where(eq(tenants.userId, userId)).limit(1);
	return rows[0] as Tenant;
}

export async function updateTenant(userId: string, data: UpdateTenantDto) {
	const { businessHours, ...rest } = data;
	const result = await getDb()
		.update(tenants)
		.set({
			...rest,
			...(businessHours !== undefined ? { businessHours } : {}),
			updatedAt: Date.now(),
		})
		.where(eq(tenants.userId, userId))
		.returning();
	return result[0];
}

export async function getTenantBySlug(slug: string) {
	const rows = await getDb().select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
	return rows[0];
}

export async function getAllTenantSlugs() {
	return await getDb().select({ slug: tenants.slug }).from(tenants);
}

export async function listTenants() {
	return getDb().select().from(tenants).where(eq(tenants.isActive, true));
}

export async function updateTenantOrderAcceptance(id: string, acceptsOrders: boolean) {
	const result = await getDb().update(tenants).set({ acceptsOrders }).where(eq(tenants.id, id)).returning();
	return result[0];
}

export async function searchTenantsByName(query: string, limit = 50) {
    const baseConditions = and(
        eq(tenants.isActive, true),
        eq(tenants.onboardingCompleted, true),
    );

    const whereClause = query.trim()
        ? and(like(tenants.name, `%${query.trim()}%`), baseConditions)
        : baseConditions;

    return getDb()
        .select({
            name: tenants.name,
            slug: tenants.slug,
            address: tenants.address,
            latitude: tenants.latitude,
            longitude: tenants.longitude,
            description: tenants.description,
            tags: tenants.tags,
            acceptsOrders: tenants.acceptsOrders,
            closedUntil: tenants.closedUntil,
            logoUrl: tenants.logoUrl,
        })
        .from(tenants)
        .where(whereClause)
        .limit(limit);
}
