import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  phoneNumber: text('phone_number').notNull(),
  email: text('email'),
  businessHours: text('business_hours'),
  acceptsOrders: integer('accepts_orders', { mode: 'boolean' }).notNull().default(true),
  closedUntil: text('closed_until'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  nameIdx: index('tenants_name_idx').on(table.name),
  acceptsOrdersIdx: index('tenants_accepts_orders_idx').on(table.acceptsOrders),
}));
