import { ulid } from 'ulidx';
import { initDatabase } from '@nummygo/shared/db';
import {
  createOrder,
  createOrderItems,
  getOrdersByUser,
  getOrdersByTenant,
  getOrderById,
  updateOrderStatus,
  getMenuItemById,
  getOrdersByCheckoutSession,
  getTenantsByIds,
} from '@nummygo/shared/db/queries';
import { VALID_STATUS_TRANSITIONS } from '@nummygo/shared/models/dtos';
import type { Order } from '@nummygo/shared/models/types';
import type { OrderStatus } from '@nummygo/shared/models/enums';
import type {
  CustomerCheckoutDto,
  PosCheckoutDto,
  UpdateOrderStatusDto,
  GetOrdersByTenantDto,
  CreateOrderRecordDto,
  CreateOrderItemRecordDto,
  GetOrderGroupDto,
} from '@nummygo/shared/models/dtos';
import type { Env } from '../index';

// ── DB init ────────────────────────────────────────────────────────────────

function initDb(env: Env) {
  initDatabase(env.DB);
}

// ── DO broadcast helper ────────────────────────────────────────────────────

/**
 * Send a broadcast message to a TenantOrderDO instance.
 * The DO wakes from hibernation, fans out to all tagged sockets, then sleeps.
 */
async function broadcastToDO(
  env: Env,
  doName: string,
  tags: string[],
  message: { type: string; order: Order },
) {
  const doId = env.TENANT_ORDER_DO.idFromName(doName);
  const stub = env.TENANT_ORDER_DO.get(doId);
  await stub.fetch(new Request('http://internal/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags, message }),
  }));
}

// ── placeCheckoutOrder ─────────────────────────────────────────────────────

export async function placeCheckoutOrder(
  env: Env,
  input: CustomerCheckoutDto,
  userId: string | null = null,
): Promise<{ checkoutSessionId: string }> {
  initDb(env);

  // ── 1. Pre-flight validation: all vendors at once ─────────────────────
  const tenantIds = [...new Set(input.cart.map((v) => v.tenantId))];
  const tenantRows = await getTenantsByIds(tenantIds);
  const tenantMap = new Map(tenantRows.map((t) => [t.id, t]));

  for (const tenantId of tenantIds) {
    const tenant = tenantMap.get(tenantId);
    if (!tenant) {
      throw new Error(`Vendor ${tenantId} not found`);
    }
    if (!tenant.acceptsOrders) {
      throw new Error(`${tenant.name} is not accepting orders right now`);
    }
    if (tenant.closedUntil && tenant.closedUntil > Date.now()) {
      const reopenTime = new Date(tenant.closedUntil).toLocaleTimeString();
      throw new Error(`${tenant.name} is closed until ${reopenTime}`);
    }
  }

  // ── 2. Generate checkout session ID ───────────────────────────────────
  const sessionId = ulid();
  const now = Date.now();
  const createdOrders: Order[] = [];

  // ── 3. Process each vendor cart ───────────────────────────────────────
  for (const vendorCart of input.cart) {
    const resolvedItems = await Promise.all(
      vendorCart.items.map(async (line) => {
        const menuItem = await getMenuItemById(line.menuItemId);
        if (!menuItem) throw new Error(`Menu item ${line.menuItemId} not found`);
        if (!menuItem.isAvailable) throw new Error(`${menuItem.name} is currently unavailable`);
        return { ...line, unitPrice: menuItem.price, name: menuItem.name };
      }),
    );

    const totalAmount = resolvedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const orderId = ulid();

    const orderRecord: CreateOrderRecordDto = {
      id: orderId,
      userId: userId ?? null,
      tenantId: vendorCart.tenantId,
      checkoutSessionId: sessionId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail ?? null,
      totalAmount,
      isPosOrder: false,
      paymentMethod: vendorCart.paymentMethod,
      fulfillmentMethod: vendorCart.fulfillmentMethod,
      deliveryAddress: vendorCart.fulfillmentMethod === 'delivery' ? input.globalDeliveryAddress : null,
      specialInstruction: vendorCart.specialInstruction ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const row = await createOrder(orderRecord);

    const orderItemRecords: CreateOrderItemRecordDto[] = resolvedItems.map((item) => ({
      id: ulid(),
      tenantId: vendorCart.tenantId,
      orderId,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      totalPrice: item.unitPrice * item.quantity,
      createdAt: now,
    }));

    await createOrderItems(orderItemRecords);

    const order = rowToOrder(row);
    createdOrders.push(order);

    // Broadcast ORDER_CREATED to the tenant's DO
    await broadcastToDO(env, vendorCart.tenantId, [`tenant:${vendorCart.tenantId}`], {
      type: 'ORDER_CREATED',
      order,
    });
  }

  // Broadcast to the session DO (for customer tracking page)
  for (const order of createdOrders) {
    await broadcastToDO(env, `session:${sessionId}`, [`session:${sessionId}`], {
      type: 'ORDER_CREATED',
      order,
    });
  }

  return { checkoutSessionId: sessionId };
}

// ── placePosOrder ──────────────────────────────────────────────────────────

export async function placePosOrder(
  env: Env,
  tenantId: string,
  input: PosCheckoutDto,
): Promise<Order> {
  initDb(env);

  const resolvedItems = await Promise.all(
    input.items.map(async (line) => {
      const menuItem = await getMenuItemById(line.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${line.menuItemId} not found`);
      if (!menuItem.isAvailable) throw new Error(`${menuItem.name} is currently unavailable`);
      return { ...line, unitPrice: menuItem.price };
    }),
  );

  const totalAmount = resolvedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const orderId = ulid();
  const now = Date.now();

  const orderRecord: CreateOrderRecordDto = {
    id: orderId,
    userId: null,
    tenantId,
    checkoutSessionId: undefined,
    customerName: input.customerName ?? null,
    customerPhone: input.customerPhone ?? null,
    customerEmail: input.customerEmail ?? null,
    totalAmount,
    isPosOrder: true,
    paymentMethod: input.paymentMethod,
    fulfillmentMethod: 'pickup', // POS orders are typically pickup/counter
    deliveryAddress: null,
    specialInstruction: input.specialInstruction ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const row = await createOrder(orderRecord);

  const orderItemRecords: CreateOrderItemRecordDto[] = resolvedItems.map((item) => ({
    id: ulid(),
    tenantId,
    orderId,
    menuItemId: item.menuItemId,
    quantity: item.quantity,
    totalPrice: item.unitPrice * item.quantity,
    createdAt: now,
  }));

  await createOrderItems(orderItemRecords);

  const order = rowToOrder(row);

  // Broadcast to tenant dashboard
  await broadcastToDO(env, tenantId, [`tenant:${tenantId}`], {
    type: 'ORDER_CREATED',
    order,
  });

  return order;
}

// ── fetchUserOrders ────────────────────────────────────────────────────────

export async function fetchUserOrders(env: Env, userId: string): Promise<Order[]> {
  initDb(env);
  const rows = await getOrdersByUser(userId);
  return rows.map(rowToOrder);
}

// ── fetchTenantOrders ──────────────────────────────────────────────────────

export async function fetchTenantOrders(env: Env, input: GetOrdersByTenantDto): Promise<Order[]> {
  initDb(env);
  const rows = await getOrdersByTenant(input.tenantId, {
    status: input.status,
    limit: input.limit,
    offset: input.offset,
  });
  return rows.map(rowToOrder);
}

// ── fetchCheckoutSession ───────────────────────────────────────────────────

export async function fetchCheckoutSession(env: Env, input: GetOrderGroupDto): Promise<Order[]> {
  initDb(env);
  const rows = await getOrdersByCheckoutSession(input.checkoutSessionId);
  return rows.map(rowToOrder);
}

// ── changeOrderStatus ──────────────────────────────────────────────────────

export async function changeOrderStatus(env: Env, input: UpdateOrderStatusDto): Promise<Order> {
  initDb(env);

  // ── Validate status transition ──────────────────────────────────────
  const existing = await getOrderById(input.orderId);
  if (!existing) throw new Error(`Order ${input.orderId} not found`);

  const currentStatus = existing.status as OrderStatus;
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(input.status)) {
    throw new Error(
      `Cannot transition from "${currentStatus}" to "${input.status}". ` +
      `Allowed: ${allowed?.join(', ') || 'none'}`,
    );
  }

  // ── Persist ─────────────────────────────────────────────────────────
  const row = await updateOrderStatus(input.orderId, input.status, input.rejectionReason);
  const order = rowToOrder(row);

  // ── Broadcast to tenant DO ──────────────────────────────────────────
  const tags = [`tenant:${order.tenantId}`];

  // Also broadcast to the customer's checkout session if it exists
  if (order.checkoutSessionId) {
    tags.push(`session:${order.checkoutSessionId}`);
  }

  await broadcastToDO(env, order.tenantId, tags, {
    type: 'ORDER_UPDATED',
    order,
  });

  // If the order is part of a checkout session, also broadcast to the session DO
  if (order.checkoutSessionId) {
    await broadcastToDO(env, `session:${order.checkoutSessionId}`, [`session:${order.checkoutSessionId}`], {
      type: 'ORDER_UPDATED',
      order,
    });
  }

  return order;
}

// ── helpers ────────────────────────────────────────────────────────────────

function rowToOrder(row: typeof import('@nummygo/shared/db/schema').orders.$inferSelect): Order {
  return {
    id: row.id,
    userId: row.userId ?? null,
    tenantId: row.tenantId,
    checkoutSessionId: row.checkoutSessionId ?? null,
    customerName: row.customerName ?? null,
    customerPhone: row.customerPhone ?? null,
    customerEmail: row.customerEmail ?? null,
    status: row.status,
    paymentMethod: row.paymentMethod,
    fulfillmentMethod: row.fulfillmentMethod,
    deliveryAddress: row.deliveryAddress ?? null,
    isPosOrder: row.isPosOrder,
    totalAmount: parseFloat((row.totalAmount / 100).toFixed(2)),
    specialInstruction: row.specialInstruction ?? null,
    rejectionReason: row.rejectionReason ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? null,
    completedAt: row.completedAt ?? null,
  };
}
