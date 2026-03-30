/**
 * packages/shared/src/db-queries/tenants.ts
 *
 * Pure database access layer for tenants.
 */

import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { tenants, type NewDbTenant } from './schema';
import type * as schema from './schema';

type DB = DrizzleD1Database<typeof schema>;

// ── createTenant ───────────────────────────────────────────────────────────

export async function createTenant(db: DB, data: NewDbTenant) {
  const result = await db.insert(tenants).values(data).returning();
  const row = result[0];
  if (!row) throw new Error('Insert returned no rows');
  return row;
}

// ── getTenantById ──────────────────────────────────────────────────────────

export async function getTenantById(db: DB, tenantId: string) {
  const rows = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  return rows[0];
}

// ── getTenantBySlug ────────────────────────────────────────────────────────

/**
 * Look up a tenant by their URL slug.
 * Used when a customer opens /order/:slug.
 */
export async function getTenantBySlug(db: DB, slug: string) {
  const rows = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1);
  return rows[0];
}

// ── listTenants ────────────────────────────────────────────────────────────

export async function listTenants(db: DB) {
  return db.select().from(tenants);
}
