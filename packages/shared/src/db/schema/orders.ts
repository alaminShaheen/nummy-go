import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { tenants } from './tenants';
import { ORDER_STATUS, PAYMENT_METHOD, ORDER_MODIFICATION_STATUS } from './enums';

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  checkoutSessionId: text('checkout_session_id'),
  
  // Guest / Customer details
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  customerEmail: text('customer_email'),
  
  // Order specifics
  paymentMethod: text('payment_method', { enum: PAYMENT_METHOD }).notNull().default('counter'),
  fulfillmentMethod: text('fulfillment_method', { enum: ['pickup', 'delivery'] }).notNull().default('pickup'),
  deliveryAddress: text('delivery_address'),
  isPosOrder: integer('is_pos_order', { mode: 'boolean' }).notNull().default(false),
  
  status: text('status', { enum: ORDER_STATUS }).notNull().default('accepted'),
  totalAmount: integer('total_amount').notNull(),
  specialInstruction: text('special_instruction'),
  rejectionReason: text('rejection_reason'),

  // Scheduling & Delays
  scheduledFor: integer('scheduled_for', { mode: 'number' }), // nullable unix timestamp
  delayMinutes: integer('delay_minutes').notNull().default(0),
  delayMessage: text('delay_message'),

  // Modification requests
  modificationStatus: text('modification_status', { enum: ORDER_MODIFICATION_STATUS }),

  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }),
  completedAt: integer('completed_at', { mode: 'number' }),
}, (table) => ({
  tenantIdx: index('orders_tenant_id_idx').on(table.tenantId),
  userIdx: index('orders_user_id_idx').on(table.userId),
  sessionIdx: index('orders_session_idx').on(table.checkoutSessionId),
  statusIdx: index('orders_status_idx').on(table.status),
  tenantCreatedIdx: index('orders_tenant_created_idx').on(table.tenantId, table.createdAt),
  modStatusIdx: index('orders_modification_status_idx').on(table.modificationStatus),
}));

