import { sqliteTable, text, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { tenants } from './tenants';
import { ORDER_STATUS } from './enums';

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  status: text('status', { enum: ORDER_STATUS }).notNull().default('pending'),
  totalAmount: real('total_amount').notNull(),
  specialInstruction: text('special_instruction'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at'),
  completedAt: text('completed_at'),
}, (table) => ({
  tenantIdx: index('orders_tenant_id_idx').on(table.tenantId),
  userIdx: index('orders_user_id_idx').on(table.userId),
  statusIdx: index('orders_status_idx').on(table.status),
  tenantCreatedIdx: index('orders_tenant_created_idx').on(table.tenantId, table.createdAt),
}));
