import { eq, and } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { menuItems } from '../schema/menu-items';
import type * as schema from '../schema';

type DB = DrizzleD1Database<typeof schema>;

export async function createMenuItem(db: DB, data: typeof menuItems.$inferInsert) {
  const result = await db.insert(menuItems).values(data).returning();
  const row = result[0];
  if (!row) throw new Error('Insert returned no rows');
  return row;
}

export async function getMenuItemById(db: DB, id: string) {
  const rows = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return rows[0];
}

export async function getMenuItemsByTenant(db: DB, tenantId: string) {
  return db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.tenantId, tenantId), eq(menuItems.isAvailable, true)));
}

export async function getMenuItemsByCategory(db: DB, tenantId: string, category: string) {
  return db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.tenantId, tenantId), eq(menuItems.category, category), eq(menuItems.isAvailable, true)));
}

export async function getFeaturedMenuItems(db: DB, tenantId: string) {
  return db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.tenantId, tenantId), eq(menuItems.isFeatured, true)));
}

export async function updateMenuItemAvailability(db: DB, id: string, isAvailable: boolean) {
  const result = await db
    .update(menuItems)
    .set({ isAvailable })
    .where(eq(menuItems.id, id))
    .returning();
  return result[0];
}
