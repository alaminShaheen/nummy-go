import { ulid } from 'ulidx';
import { initDatabase } from '@nummygo/shared/db';
import {
  createOrder,
  createOrderItems,
  getOrdersByUser,
  getOrdersByTenant,
  updateOrderStatus,
  getMenuItemById,
  getOrdersByCheckoutSession,
} from '@nummygo/shared/db/queries';
import type { Order } from '@nummygo/shared/models/types';
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

// ── placeCheckoutOrder ─────────────────────────────────────────────────────

export async function placeCheckoutOrder(
  env: Env,
  input: CustomerCheckoutDto,
  userId: string | null = null
): Promise<{ checkoutSessionId: string }> {
  initDb(env);

  const sessionId = ulid();
  const now = Date.now();

  for (const vendorCart of input.cart) {
    const resolvedItems = await Promise.all(
      vendorCart.items.map(async (line) => {
        const menuItem = await getMenuItemById(line.menuItemId);
        if (!menuItem) throw new Error(`Menu item ${line.menuItemId} not found`);
        return { ...line, unitPrice: menuItem.price };
      })
    );

    const totalAmount = resolvedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
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
      specialInstruction: vendorCart.specialInstruction ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await createOrder(orderRecord);

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
  }

  return { checkoutSessionId: sessionId };
}

// ── placePosOrder ──────────────────────────────────────────────────────────

export async function placePosOrder(
  env: Env,
  tenantId: string,
  input: PosCheckoutDto
): Promise<Order> {
  initDb(env);

  const resolvedItems = await Promise.all(
    input.items.map(async (line) => {
      const menuItem = await getMenuItemById(line.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${line.menuItemId} not found`);
      return { ...line, unitPrice: menuItem.price };
    })
  );

  const totalAmount = resolvedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const orderId = ulid();
  const now = Date.now();

  const orderRecord: CreateOrderRecordDto = {
    id: orderId,
    userId: null,
    tenantId: tenantId,
    checkoutSessionId: undefined,
    customerName: input.customerName ?? null,
    customerPhone: input.customerPhone ?? null,
    customerEmail: input.customerEmail ?? null,
    totalAmount,
    isPosOrder: true,
    paymentMethod: input.paymentMethod,
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

  return rowToOrder(row);
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
  const row = await updateOrderStatus(input.orderId, input.status);
  return rowToOrder(row);
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
    isPosOrder: row.isPosOrder,
    totalAmount: row.totalAmount,
    specialInstruction: row.specialInstruction ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? null,
    completedAt: row.completedAt ?? null,
  };
}
