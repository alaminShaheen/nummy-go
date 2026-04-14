import { sqliteTable, text, real, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { tenants } from './tenants';
import { orders } from './orders';
import { menuItems } from './menu-items';

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: text('menu_item_id').references(() => menuItems.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull(),
  totalPrice: integer('total_price').notNull(),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
}, (table) => ({
  tenantIdx: index('order_items_tenant_id_idx').on(table.tenantId),
  orderIdx: index('order_items_order_id_idx').on(table.orderId),
  menuItemIdx: index('order_items_menu_item_id_idx').on(table.menuItemId),
}));
