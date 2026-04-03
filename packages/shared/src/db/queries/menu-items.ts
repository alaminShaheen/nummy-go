import { eq, and } from 'drizzle-orm';
import { getDb } from '../client';
import { menuItems } from '../schema/menu-items';
import { menuItemCategories } from '../schema/menu-item-categories';
import type {
  CreateMenuItemRecordDto,
  CreateMenuItemCategoryRecordDto,
  UpdateMenuItemDto,
} from '../../models/dtos';

export async function createMenuItem(data: CreateMenuItemRecordDto) {
  const result = await getDb().insert(menuItems).values(data).returning();
  const row = result[0];
  if (!row) throw new Error('Insert returned no rows');
  return row;
}

export async function getMenuItemById(id: string) {
  const rows = await getDb().select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return rows[0];
}

export async function getMenuItemsByTenant(tenantId: string) {
  return getDb()
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.tenantId, tenantId), eq(menuItems.isAvailable, true)));
}

export async function getMenuItemsByCategory(tenantId: string, categoryId: string) {
  return getDb()
    .select()
    .from(menuItems)
    .where(and(
      eq(menuItems.tenantId, tenantId),
      eq(menuItems.categoryId, categoryId),
      eq(menuItems.isAvailable, true),
    ));
}

export async function getFeaturedMenuItems(tenantId: string) {
  return getDb()
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.tenantId, tenantId), eq(menuItems.isFeatured, true)));
}

export async function updateMenuItem(id: string, data: UpdateMenuItemDto) {
  const result = await getDb()
    .update(menuItems)
    .set({ ...data, updatedAt: Date.now() })
    .where(eq(menuItems.id, id))
    .returning();
  return result[0];
}

export async function updateMenuItemAvailability(id: string, isAvailable: boolean) {
  const result = await getDb()
    .update(menuItems)
    .set({ isAvailable, updatedAt: Date.now() })
    .where(eq(menuItems.id, id))
    .returning();
  return result[0];
}

// ── Category queries ───────────────────────────────────────────────────────

export async function createMenuItemCategory(data: CreateMenuItemCategoryRecordDto) {
  const result = await getDb().insert(menuItemCategories).values(data).returning();
  const row = result[0];
  if (!row) throw new Error('Insert returned no rows');
  return row;
}

export async function getMenuItemCategoriesByTenant(tenantId: string) {
  return getDb()
    .select()
    .from(menuItemCategories)
    .where(eq(menuItemCategories.tenantId, tenantId))
    .orderBy(menuItemCategories.sortOrder);
}

export async function deleteMenuItemCategory(id: string) {
  return getDb().delete(menuItemCategories).where(eq(menuItemCategories.id, id));
}
