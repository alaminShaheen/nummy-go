/**
 * packages/shared/src/db-queries/customers.ts
 *
 * Pure database access layer for customers.
 */

import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { customers, type NewDbCustomer } from './schema';
import type * as schema from './schema';

type DB = DrizzleD1Database<typeof schema>;

// ── createCustomer ─────────────────────────────────────────────────────────

export async function createCustomer(db: DB, data: NewDbCustomer) {
  const result = await db.insert(customers).values(data).returning();
  const row = result[0];
  if (!row) throw new Error('Insert returned no rows');
  return row;
}

// ── getCustomerById ────────────────────────────────────────────────────────

export async function getCustomerById(db: DB, customerId: string) {
  const rows = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);
  return rows[0];
}

// ── getCustomerByEmail ─────────────────────────────────────────────────────

/**
 * Look up a customer by email.
 * Used for "returning customer" lookup at checkout.
 */
export async function getCustomerByEmail(db: DB, email: string) {
  const rows = await db
    .select()
    .from(customers)
    .where(eq(customers.email, email))
    .limit(1);
  return rows[0];
}

// ── upsertCustomer ─────────────────────────────────────────────────────────

/**
 * Insert a customer or return the existing row if the email already exists.
 * This avoids duplicate customers on repeated orders.
 */
export async function upsertCustomer(db: DB, data: NewDbCustomer) {
  // Try to find existing customer first
  const existing = await getCustomerByEmail(db, data.email);
  if (existing) return existing;
  return createCustomer(db, data);
}
