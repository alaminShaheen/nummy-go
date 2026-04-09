import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { orders } from './orders';
import { tenants } from './tenants';
import { ORDER_MODIFICATION_STATUS } from './enums';

/**
 * Stores the audit log of every modification request a customer makes against
 * an order, along with the tenant's decision and optional note.
 *
 * One order can have many modification records (one per request cycle).
 * Only one record per order may have status = 'pending' at any given time
 * — enforced at the service layer.
 */
export const orderModifications = sqliteTable('order_modifications', {
  id: text('id').primaryKey(),

  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),

  /**
   * JSON-stringified snapshot of the requested changes.
   * Shape: { items: Array<{ menuItemId: string; quantity: number }>, specialInstruction?: string }
   */
  requestedChanges: text('requested_changes').notNull(),

  status: text('status', { enum: ORDER_MODIFICATION_STATUS }).notNull().default('pending'),

  /** Free-text note the tenant adds when accepting or rejecting the request. */
  tenantNote: text('tenant_note'),

  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  reviewedAt: integer('reviewed_at', { mode: 'number' }),
}, (table) => ({
  orderIdx: index('order_modifications_order_id_idx').on(table.orderId),
  tenantIdx: index('order_modifications_tenant_id_idx').on(table.tenantId),
  statusIdx: index('order_modifications_status_idx').on(table.status),
}));
