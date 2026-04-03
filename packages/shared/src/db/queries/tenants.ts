import { eq } from 'drizzle-orm';
import { getDb } from '../client';
import { tenants } from '../schema';
import type { CreateTenantRecordDto, UpdateTenantDto } from '../../models';

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

export async function getTenantByUserId(userId: string) {
  const rows = await getDb().select().from(tenants).where(eq(tenants.userId, userId)).limit(1);
  return rows[0];
}

export async function updateTenant(userId: string, data: UpdateTenantDto) {
  const { businessHours, ...rest } = data;
  const result = await getDb()
    .update(tenants)
    .set({
      ...rest,
      ...(businessHours !== undefined
        ? { businessHours }
        : {}),
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

export async function listTenants() {
  return getDb().select().from(tenants).where(eq(tenants.isActive, true));
}

export async function updateTenantOrderAcceptance(id: string, acceptsOrders: boolean) {
  const result = await getDb()
    .update(tenants)
    .set({ acceptsOrders })
    .where(eq(tenants.id, id))
    .returning();
  return result[0];
}
