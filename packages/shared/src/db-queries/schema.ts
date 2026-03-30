/**
 * packages/shared/src/db-queries/schema.ts
 *
 * Drizzle ORM table definitions for Cloudflare D1 (SQLite).
 *
 * Why SQLite/D1?
 *  - Cloudflare D1 is a globally distributed SQLite-compatible database.
 *  - Drizzle's `sqlite-core` maps directly to D1's SQL dialect.
 *
 * These table definitions are the source of truth for the database schema.
 * Run `drizzle-kit generate` from api-worker to generate SQL migrations.
 */

import {
  sqliteTable,
  text,
  integer,
  real,
} from 'drizzle-orm/sqlite-core';

// ── tenants ────────────────────────────────────────────────────────────────

export const tenants = sqliteTable('tenants', {
  id:        text('id').primaryKey(),               // UUID v4
  name:      text('name').notNull(),
  slug:      text('slug').notNull().unique(),        // URL-safe, used in WS path
  email:     text('email').notNull().unique(),
  phone:     text('phone'),
  address:   text('address'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type DbTenant = typeof tenants.$inferSelect;
export type NewDbTenant = typeof tenants.$inferInsert;

// ── customers ──────────────────────────────────────────────────────────────

export const customers = sqliteTable('customers', {
  id:        text('id').primaryKey(),               // UUID v4
  name:      text('name').notNull(),
  email:     text('email').notNull().unique(),
  phone:     text('phone'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type DbCustomer = typeof customers.$inferSelect;
export type NewDbCustomer = typeof customers.$inferInsert;

// ── orders ─────────────────────────────────────────────────────────────────

export const orders = sqliteTable('orders', {
  id:         text('id').primaryKey(),              // UUID v4
  tenantId:   text('tenant_id').notNull().references(() => tenants.id),
  customerId: text('customer_id').notNull().references(() => customers.id),

  // SQLite doesn't have a JSON column type, so items are stored as a
  // serialised JSON string and parsed on read.
  itemsJson:  text('items_json').notNull(),

  // D1 supports CHECK constraints via raw SQL, but Drizzle exposes status
  // as a plain text column – validation is enforced at the application layer
  // via Zod (see schemas/index.ts).
  status:     text('status').notNull().default('PENDING'),

  totalPrice: real('total_price').notNull(),
  notes:      text('notes'),

  createdAt:  integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:  integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type DbOrder = typeof orders.$inferSelect;
export type NewDbOrder = typeof orders.$inferInsert;
