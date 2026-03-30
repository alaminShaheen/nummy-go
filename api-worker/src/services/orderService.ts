/**
 * api-worker/src/services/orderService.ts
 *
 * Business logic layer for orders.
 *
 * This is the ONLY place where business rules live:
 *  - ID generation
 *  - Price calculation
 *  - Timestamp stamping
 *  - Calling DB queries
 *  - Calling the Durable Object to broadcast real-time updates
 *
 * Services accept the `Env` bindings (not raw DB) so they can create
 * a Drizzle instance on each call (CF Workers don't support long-lived connections).
 */

import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@nummygo/shared/db-queries/schema';
import {
  createOrder,
  getOrdersByCustomer,
  getOrdersByTenant,
  updateOrderStatus,
  type DbOrder,
} from '@nummygo/shared/db-queries';
import type {
  Order,
  OrderItem,
  OrderStatus,
  WsMessage,
} from '@nummygo/shared/types';
import type {
  CreateOrderInput,
  GetDashboardOrdersInput,
  UpdateOrderInput,
} from '@nummygo/shared/schemas';
import type { Env } from '../index';

// ── DB helper ──────────────────────────────────────────────────────────────

/** Create a Drizzle D1 client from the Worker's env binding. */
function getDb(env: Env) {
  return drizzle(env.DB, { schema });
}

// ── Type mapping ───────────────────────────────────────────────────────────

/** Map a raw Drizzle row to the domain Order type. */
function dbRowToOrder(row: DbOrder): Order {
  return {
    id:          row.id,
    tenantId:    row.tenantId,
    customerId:  row.customerId,
    // Parse the JSON items array back to OrderItem[]
    items:       JSON.parse(row.itemsJson) as OrderItem[],
    status:      row.status as OrderStatus,
    totalPrice:  row.totalPrice,
    notes:       row.notes ?? undefined,
    createdAt:   row.createdAt,
    updatedAt:   row.updatedAt,
  };
}

// ── placeOrder ─────────────────────────────────────────────────────────────

/**
 * Create a new order, persist it to D1, and broadcast via Durable Object.
 *
 * @returns The created Order domain object.
 */
export async function placeOrder(
  env: Env,
  input: CreateOrderInput
): Promise<Order> {
  const db = getDb(env);

  // Calculate total price from items
  const totalPrice = input.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const now = new Date();
  const orderId = crypto.randomUUID();

  const newRow = await createOrder(db, {
    id:          orderId,
    tenantId:    input.tenantId,
    customerId:  input.customerId,
    itemsJson:   JSON.stringify(input.items),
    status:      'PENDING',
    totalPrice,
    notes:       input.notes ?? null,
    createdAt:   now,
    updatedAt:   now,
  });

  const order = dbRowToOrder(newRow);

  // ── Broadcast to Durable Object ────────────────────────────────
  // Notify all WebSocket clients connected to this tenant's room.
  await broadcastToDO(env, input.tenantId, {
    type:  'ORDER_CREATED',
    order,
  });

  return order;
}

// ── fetchCustomerOrders ────────────────────────────────────────────────────

export async function fetchCustomerOrders(
  env: Env,
  customerId: string
): Promise<Order[]> {
  const db   = getDb(env);
  const rows = await getOrdersByCustomer(db, customerId);
  return rows.map(dbRowToOrder);
}

// ── fetchTenantOrders ──────────────────────────────────────────────────────

export async function fetchTenantOrders(
  env: Env,
  input: GetDashboardOrdersInput
): Promise<Order[]> {
  const db = getDb(env);
  const rows = await getOrdersByTenant(db, input.tenantId, {
    status: input.status,
    limit:  input.limit,
    offset: input.offset,
  });
  return rows.map(dbRowToOrder);
}

// ── changeOrderStatus ──────────────────────────────────────────────────────

/**
 * Update an order's status, persist to D1, and broadcast via Durable Object.
 */
export async function changeOrderStatus(
  env: Env,
  input: UpdateOrderInput
): Promise<Order> {
  const db  = getDb(env);
  const row = await updateOrderStatus(db, input.orderId, input.status);
  const order = dbRowToOrder(row);

  // Broadcast status change to all tenant WebSocket clients
  await broadcastToDO(env, order.tenantId, {
    type:  'ORDER_UPDATED',
    order,
  });

  return order;
}

// ── broadcastToDO ──────────────────────────────────────────────────────────

/**
 * Send a JSON message to all WebSocket clients in a tenant's DO room.
 *
 * How it works:
 *  1. Look up (or create) the TenantOrderDO instance for this tenantId.
 *  2. Send a POST request to its internal /broadcast endpoint.
 *  3. The DO fans out the message to all connected WebSockets.
 *
 * Why POST instead of direct call?
 *  Durable Objects don't expose methods directly – you communicate via
 *  internal fetch() requests. This keeps the DO interface clean and testable.
 */
async function broadcastToDO(
  env: Env,
  tenantId: string,
  message: WsMessage
): Promise<void> {
  const doId   = env.TENANT_ORDER_DO.idFromName(tenantId);
  const doStub = env.TENANT_ORDER_DO.get(doId);

  // The DO listens on /broadcast with a JSON body
  await doStub.fetch('https://internal/broadcast', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ tenantId, message }),
  });
}
