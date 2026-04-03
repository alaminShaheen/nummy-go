import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { tenants } from './tenants';

export const menuItemCategories = sqliteTable('menu_item_categories', {
  id:        text('id').primaryKey(),
  tenantId:  text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name:      text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
}, (table) => ({
  tenantIdx: index('menu_item_categories_tenant_idx').on(table.tenantId),
}));
