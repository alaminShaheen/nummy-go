import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { tenants } from '../schema/tenants';
import type * as schema from '../schema';

type DB = DrizzleD1Database<typeof schema>;

export async function createTenant(db: DB, data: typeof tenants.$inferInsert) {
  const result = await db.insert(tenants).values(data).returning();
  const row = result[0];
  if (!row) throw new Error('Insert returned no rows');
  return row;
}

export async function getTenantById(db: DB, id: string) {
  const rows = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  return rows[0];
}

export async function getTenantBySlug(db: DB, slug: string) {
  const rows = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
  return rows[0];
}

export async function listTenants(db: DB) {
  return db.select().from(tenants).where(eq(tenants.isActive, true));
}

export async function updateTenantOrderAcceptance(db: DB, id: string, acceptsOrders: boolean) {
  const result = await db
    .update(tenants)
    .set({ acceptsOrders })
    .where(eq(tenants.id, id))
    .returning();
  return result[0];
}
