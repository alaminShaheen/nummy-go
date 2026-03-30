/**
 * packages/shared/src/db-queries/orders.ts
 *
 * Pure database access layer for orders.
 * NO business logic here – just SQL via Drizzle.
 *
 * Design rules:
 *  - Every function takes a `db` parameter (DrizzleD1Database instance).
 *  - Functions return raw DB rows (DbOrder), not domain types.
 *  - Callers (services/orderService.ts) map DB rows → domain types.
 *
 * Why separate DB queries from services?
 *  - Testability: queries can be tested against a real D1 instance.
 *  - Clarity: SQL reads like SQL; business rules live elsewhere.
 */

import { eq, and, desc } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { orders, type NewDbOrder } from './schema';
import type * as schema from './schema';

type DB = DrizzleD1Database<typeof schema>;

// ── createOrder ────────────────────────────────────────────────────────────

/**
 * Insert a new order row.
 * The caller is responsible for generating the UUID and setting timestamps.
 */
export async function createOrder(db: DB, data: NewDbOrder) {
  const result = await db.insert(orders).values(data).returning();
  // D1 returning() gives an array; we always insert one row.
  const row = result[0];
  if (!row) throw new Error('Insert returned no rows');
  return row;
}

// ── getOrdersByTenant ──────────────────────────────────────────────────────

/**
 * Fetch all orders for a given tenant, newest first.
 * Optionally filter by status.
 */
export async function getOrdersByTenant(
  db: DB,
  tenantId: string,
  options: { status?: string; limit?: number; offset?: number } = {}
) {
  const { status, limit = 50, offset = 0 } = options;

  // Build where clause conditionally
  const whereClause = status
    ? and(eq(orders.tenantId, tenantId), eq(orders.status, status))
    : eq(orders.tenantId, tenantId);

  return db
    .select()
    .from(orders)
    .where(whereClause)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);
}

// ── getOrdersByCustomer ────────────────────────────────────────────────────

/** Fetch all orders placed by a specific customer, newest first. */
export async function getOrdersByCustomer(db: DB, customerId: string) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));
}

// ── getOrderById ───────────────────────────────────────────────────────────

/** Fetch a single order by its ID. Returns undefined if not found. */
export async function getOrderById(db: DB, orderId: string) {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  return rows[0];
}

// ── updateOrderStatus ──────────────────────────────────────────────────────

/**
 * Update an order's status and bump the updatedAt timestamp.
 * Returns the updated row.
 */
export async function updateOrderStatus(
  db: DB,
  orderId: string,
  status: string
) {
  const result = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();

  const row = result[0];
  if (!row) throw new Error(`Order ${orderId} not found`);
  return row;
}
