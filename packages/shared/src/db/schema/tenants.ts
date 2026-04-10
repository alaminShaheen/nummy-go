import { sqliteTable, text, integer, index, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  phoneNumber: text('phone_number').notNull(),
  email: text('email'),
  address: text('address'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  promotionalHeading: text('promotional_heading'),
  description: text('description'),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  logoUrl: text('logo_url'),
  heroImageUrl: text('hero_image_url'),
  businessHours: text('business_hours', { mode: 'json' }),
  acceptsOrders: integer('accepts_orders', { mode: 'boolean' }).notNull().default(true),
  closedUntil: integer('closed_until', { mode: 'number' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).notNull().default(false),
  /** Minutes after order creation the customer may request modifications: 15 | 30 | 45 | 60 */
  orderModificationThreshold: integer('order_modification_threshold').notNull().default(30),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
}, (table) => ({
  nameIdx: index('tenants_name_idx').on(table.name),
  acceptsOrdersIdx: index('tenants_accepts_orders_idx').on(table.acceptsOrders),
}));
