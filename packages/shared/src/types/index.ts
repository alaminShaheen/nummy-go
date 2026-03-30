/**
 * packages/shared/src/types/index.ts
 *
 * Core domain types for NummyGo.
 * These are pure TypeScript interfaces – no runtime code.
 * They are derived conceptually from the Drizzle schema but kept
 * separate so the frontend can use them without importing drizzle-orm.
 */

// ── Order ──────────────────────────────────────────────────────────────────

/** The lifecycle of a single order. */
export type OrderStatus =
  | 'PENDING'     // Just placed, not yet seen by the tenant
  | 'PREPARING'   // Tenant accepted and is preparing the order
  | 'READY'       // Order is ready for pick-up / delivery
  | 'DELIVERED'   // Order has been handed to the customer
  | 'CANCELLED';  // Order was cancelled (by either side)

/** A single line item inside an order. */
export interface OrderItem {
  /** Menu item identifier. */
  menuItemId: string;
  /** Display name (denormalised for receipts). */
  name: string;
  /** Price at the time of ordering (immutable). */
  unitPrice: number;
  quantity: number;
}

/** A customer's food order. */
export interface Order {
  id: string;
  /** Which restaurant / merchant this order belongs to. */
  tenantId: string;
  /** Who placed the order. */
  customerId: string;
  /** Ordered items (stored as JSON in D1). */
  items: OrderItem[];
  status: OrderStatus;
  /** Sum of (unitPrice * quantity) for all items. */
  totalPrice: number;
  /** Optional delivery/special instructions. */
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Tenant ─────────────────────────────────────────────────────────────────

/**
 * A "tenant" is a restaurant or merchant on the platform.
 * Each tenant has its own WebSocket room in the Durable Object.
 */
export interface Tenant {
  id: string;
  /** Public display name. */
  name: string;
  /** URL-safe identifier used in WebSocket paths: /ws/tenant/:slug */
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
}

// ── Customer ───────────────────────────────────────────────────────────────

/** A customer who places orders. */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
}

// ── WebSocket message shapes ───────────────────────────────────────────────

/**
 * Messages broadcast by TenantOrderDO over WebSocket.
 * The frontend discriminates on the `type` field.
 */
export type WsMessage =
  | { type: 'ORDER_CREATED'; order: Order }
  | { type: 'ORDER_UPDATED'; order: Order }
  | { type: 'PING' };
