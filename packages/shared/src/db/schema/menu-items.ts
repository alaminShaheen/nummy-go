import { sqliteTable, text, real, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { tenants } from './tenants';
import { menuItemCategories } from './menu-item-categories';

export const menuItems = sqliteTable('menu_items', {
  id:          text('id').primaryKey(),
  tenantId:    text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  categoryId:  text('category_id').references(() => menuItemCategories.id, { onDelete: 'set null' }),
  name:        text('name').notNull(),
  description: text('description'),
  imageUrl:    text('image_url'),
  price:       real('price').notNull(),
  isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
  isFeatured:  integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  createdAt:   text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt:   text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  tenantIdx:      index('menu_items_tenant_id_idx').on(table.tenantId),
  categoryIdx:    index('menu_items_category_idx').on(table.categoryId),
  tenantFeaturedIdx: index('menu_items_tenant_featured_idx').on(table.tenantId, table.isFeatured),
}));
