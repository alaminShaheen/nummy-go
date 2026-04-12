import { ulid } from 'ulidx';
import { differenceInMinutes, parse, isWithinInterval, parseISO } from 'date-fns';
import { initDatabase } from '@nummygo/shared/db';
import {
  createOrder,
  createOrderItems,
  deleteOrderItemsByOrderId,
  getOrdersByUser,
  getOrdersByTenant,
  getOrderById,
  getOrderWithItems,
  updateOrderStatus,
  updateOrderDelay,
  updateOrderModificationStatus,
  updateOrderAfterModification,
  getMenuItemById,
  getMenuItemsByIds,
  getOrdersByCheckoutSession,
  getTenantsByIds,
  getTenantById,
  createOrderModification,
  getPendingModificationForOrder,
  getModificationById,
  updateModificationStatus,
  getUserById,
} from '@nummygo/shared/db/queries';
import { orderResponseSchema, orderModificationResponseSchema } from '@nummygo/shared/models/dtos';
import { VALID_STATUS_TRANSITIONS } from '@nummygo/shared/models/dtos';
import type { Order, OrderModification } from '@nummygo/shared/models/types';
import type { OrderStatus } from '@nummygo/shared/models/enums';
import type {
  CustomerCheckoutDto,
  PosCheckoutDto,
  UpdateOrderStatusDto,
  GetOrdersByTenantDto,
  CreateOrderRecordDto,
  CreateOrderItemRecordDto,
  CreateOrderModificationRecordDto,
  GetOrderGroupDto,
  RequestOrderModificationDto,
  ReviewModificationDto,
  CancelOrderRequestDto,
  CheckoutGroupResponseDto,
} from '@nummygo/shared/models/dtos';
import type { BusinessHours } from '@nummygo/shared/models/types';
import type { Env } from '../index';
import { EmailService } from './emailService';

// ── DB init ────────────────────────────────────────────────────────────────

function initDb(env: Env) {
  initDatabase(env.DB);
}

// ── DO broadcast helper ────────────────────────────────────────────────────

type BroadcastPayload =
  | { type: 'ORDER_CREATED'; order: Order }
  | { type: 'ORDER_UPDATED'; order: Order }
  | { type: 'ORDER_DELAYED'; order: Order }
  | { type: 'MODIFICATION_REQUESTED'; order: Order; modification: OrderModification }
  | { type: 'MODIFICATION_REVIEWED'; order: Order; modification: OrderModification };

/**
 * Send a broadcast message to a TenantOrderDO instance.
 * The DO wakes from hibernation, fans out to all tagged sockets, then sleeps.
 */
async function broadcastToDO(
  env: Env,
  doName: string,
  tags: string[],
  message: BroadcastPayload,
) {
  // Convert internal raw units (cents) to API units (dollars) so WebSockets match TRPC responses
  const apiMessage: any = { type: message.type };
  if ('order' in message) {
    apiMessage.order = orderResponseSchema.parse(message.order);
  }
  if ('modification' in message) {
    apiMessage.modification = orderModificationResponseSchema.parse(message.modification);
  }

  const doId = env.TENANT_ORDER_DO.idFromName(doName);
  const stub = env.TENANT_ORDER_DO.get(doId);
  await stub.fetch(new Request('http://internal/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags, message: apiMessage }),
  }));
}

// ── Business Hours validation ──────────────────────────────────────────────

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
type DayName = typeof DAY_NAMES[number];

/**
 * Validates that a requested ISO datetime string (e.g. "2026-04-08T14:30:00")
 * falls within the tenant's business hours for that day-of-week.
 *
 * Throws a descriptive error if outside of hours or if the tenant is closed that day.
 */
function assertScheduledTimeIsValid(scheduledFor: string, businessHours: BusinessHours): void {
  const date = parseISO(scheduledFor);
  const dayName = DAY_NAMES[date.getDay()] as DayName;
  const dayConfig = businessHours[dayName];

  if (dayConfig.closed) {
    const pretty = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    throw new Error(`This vendor is closed on ${pretty}. Please select a different time.`);
  }

  // Build full Date objects for open/close on the same calendar day
  const openTime = parse(dayConfig.open, 'HH:mm', date);
  const closeTime = parse(dayConfig.close, 'HH:mm', date);

  if (!isWithinInterval(date, { start: openTime, end: closeTime })) {
    throw new Error(
      `Scheduled time ${date.toLocaleTimeString()} is outside of operating hours ` +
      `(${dayConfig.open} – ${dayConfig.close}). Please choose a time within business hours.`,
    );
  }

  if (date <= new Date()) {
    throw new Error('Scheduled time must be in the future.');
  }
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

  for (const vendorCart of input.cart) {
    const tenant = tenantMap.get(vendorCart.tenantId);
    if (!tenant) {
      throw new Error(`Partner ${vendorCart.tenantId} not found`);
    }
    if (!tenant.acceptsOrders) {
      throw new Error(`${tenant.name} is not accepting orders right now`);
    }
    if (tenant.closedUntil && tenant.closedUntil > Date.now()) {
      const reopenTime = new Date(tenant.closedUntil).toLocaleTimeString();
      throw new Error(`${tenant.name} is closed until ${reopenTime}`);
    }

    // Validate scheduled time against business hours (if provided)
    if (vendorCart.scheduledFor && tenant.businessHours) {
      assertScheduledTimeIsValid(vendorCart.scheduledFor, tenant.businessHours as BusinessHours);
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
      scheduledFor: vendorCart.scheduledFor ? new Date(vendorCart.scheduledFor).getTime() : null,
      modificationStatus: null,
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

    const emailService = new EmailService(env);

    // ── Customer confirmation email
    console.log('[Email] customerEmail =', order.customerEmail);
    if (order.customerEmail) {
      const tenantInfo = tenantMap.get(order.tenantId);
      const result = await emailService.sendOrderConfirmation(tenantInfo, order, order.customerEmail);
      console.log('[Email] sendOrderConfirmation result =', JSON.stringify(result));
    } else {
      console.log('[Email] SKIPPED confirmation — no customerEmail on order');
    }

    // ── Tenant notification email
    const tenant = tenantMap.get(vendorCart.tenantId);
    const user = tenant ? await getUserById(tenant.userId) : null;
    const resolvedTenantEmail = tenant?.email || user?.email;
    console.log('[Email] tenant.email =', tenant?.email, '| user.email =', user?.email, '| resolved =', resolvedTenantEmail);
    if (resolvedTenantEmail && tenant) {
      const result = await emailService.sendTenantNewOrder(order, tenant.name, resolvedTenantEmail);
      console.log('[Email] sendTenantNewOrder result =', JSON.stringify(result));
    } else {
      console.log('[Email] SKIPPED tenant email — no resolved tenant email');
    }
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
    scheduledFor: null,
    modificationStatus: null,
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

export async function fetchCheckoutSession(env: Env, input: GetOrderGroupDto) {
  initDb(env);
  const rows = await getOrdersByCheckoutSession(input.checkoutSessionId);
  const baseOrders = rows.map(rowToOrder);

  // Enriched orders with associated item lines for the tracking UI receipt panel
  const orders = await Promise.all(
    baseOrders.map(async (o) => {
      const enriched = await getOrderWithItems(o.id);
      return { ...o, items: enriched?.items ?? [] };
    })
  );

  // Batch-fetch all unique tenant profiles
  const tenantIds = [...new Set(orders.map((o) => o.tenantId))];
  const tenantRows = await getTenantsByIds(tenantIds);
  const tenantMap = new Map(tenantRows.map((t) => [t.id, t]));

  // Build vendor info map
  const vendorInfo: Record<string, {
    name: string;
    slug: string;
    phoneNumber: string;
    logoUrl: string | null;
    address: string | null;
    modificationThreshold: number;
  }> = {};



  let tenantModificationThreshold = 30;
  for (const tenant of tenantRows) {
    vendorInfo[tenant.id] = {
      name: tenant.name,
      slug: tenant.slug,
      phoneNumber: tenant.phoneNumber,
      logoUrl: tenant.logoUrl ?? null,
      address: tenant.address ?? null,
      modificationThreshold: tenant.orderModificationThreshold ?? 30,
    };
    // Keep legacy field using first tenant's threshold
    if (tenant.id === orders[0]?.tenantId) {
      tenantModificationThreshold = tenant.orderModificationThreshold ?? 30;
    }
  }

  return { orders, tenantModificationThreshold, vendorInfo } as any;
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

// ── delayOrder ─────────────────────────────────────────────────────────────

export async function delayOrder(env: Env, input: { orderId: string, delayMinutes: number, delayMessage?: string }): Promise<Order> {
  initDb(env);

  const existing = await getOrderById(input.orderId);
  if (!existing) throw new Error(`Order ${input.orderId} not found`);

  // Persist delay
  const row = await updateOrderDelay(input.orderId, input.delayMinutes, input.delayMessage || null);
  const order = rowToOrder(row);

  // Broadcast
  const tags = [`tenant:${order.tenantId}`];
  if (order.checkoutSessionId) {
    tags.push(`session:${order.checkoutSessionId}`);
  }

  const eventPayload = {
    type: 'ORDER_DELAYED' as const,
    order,
  };

  await broadcastToDO(env, order.tenantId, tags, eventPayload);
  
  if (order.checkoutSessionId) {
    await broadcastToDO(env, `session:${order.checkoutSessionId}`, [`session:${order.checkoutSessionId}`], eventPayload);
  }

  return order;
}

// ── cancelOrderAsCustomer ──────────────────────────────────────────────────

export async function cancelOrderAsCustomer(
  env: Env,
  input: CancelOrderRequestDto,
  userId: string | null,
): Promise<Order> {
  initDb(env);

  const existing = await getOrderById(input.orderId);
  if (!existing) throw new Error(`Order ${input.orderId} not found`);

  // Only the order owner (or a guest with session) may modify
  if (userId && existing.userId && existing.userId !== userId) {
    throw new Error('You do not have permission to modify this order.');
  }

  // Orders that cannot be modified/cancelled
  const nonModifiableStatuses: string[] = ['completed', 'cancelled', 'ready'];
  if (nonModifiableStatuses.includes(existing.status)) {
    throw new Error(`Cannot cancel an order with status "${existing.status}".`);
  }

  // Fetch tenant to get modification threshold
  const tenant = await getTenantById(existing.tenantId);
  if (!tenant) throw new Error(`Tenant ${existing.tenantId} not found`);

  const thresholdMinutes = tenant.orderModificationThreshold ?? 30;
  const minutesElapsed = differenceInMinutes(Date.now(), existing.createdAt);

  if (minutesElapsed > thresholdMinutes) {
    throw new Error(
      `The modification window of ${thresholdMinutes} minutes has passed. ` +
      `Your order can no longer be cancelled.`,
    );
  }

  // Actually push the status formally to cancelled
  const inputDto: UpdateOrderStatusDto = {
    orderId: input.orderId,
    status: 'cancelled',
    rejectionReason: input.reason || 'Cancelled by customer',
  };

  const cancelledOrder = await updateOrderStatus(inputDto.orderId, inputDto.status, inputDto.rejectionReason);

  // Broadcast
  const tags = [`tenant:${existing.tenantId}`];
  if (existing.checkoutSessionId) {
    tags.push(`session:${existing.checkoutSessionId}`);
  }

  const broadcastOrder = rowToOrder(cancelledOrder);

  await broadcastToDO(env, existing.tenantId, tags, {
    type: 'ORDER_UPDATED',
    order: broadcastOrder,
  });

  if (existing.checkoutSessionId) {
    await broadcastToDO(env, `session:${existing.checkoutSessionId}`, [`session:${existing.checkoutSessionId}`], {
      type: 'ORDER_UPDATED',
      order: broadcastOrder,
    });
  }

  // Fire tenant notification email
  const emailService = new EmailService(env);
  const user = await getUserById(tenant.userId);
  const resolvedTenantEmail = tenant.email || user?.email;
  if (resolvedTenantEmail) {
    await emailService.sendTenantOrderCancelled(broadcastOrder, tenant.name, resolvedTenantEmail);
  }

  return broadcastOrder;
}

// ── requestOrderModification ───────────────────────────────────────────────

/**
 * Customer requests changes to an existing order.
 *
 * Guards:
 *  - Order must be in a modifiable state (pending | accepted | preparing).
 *  - Current time must be within the tenant's orderModificationThreshold window.
 *  - No existing 'pending' modification request may be in flight.
 */
export async function requestOrderModification(
  env: Env,
  input: RequestOrderModificationDto,
  userId: string | null,
): Promise<{ order: Order; modification: OrderModification }> {
  initDb(env);

  const existing = await getOrderById(input.orderId);
  if (!existing) throw new Error(`Order ${input.orderId} not found`);

  // Only the order owner (or a guest with session) may modify
  if (userId && existing.userId && existing.userId !== userId) {
    throw new Error('You do not have permission to modify this order.');
  }

  // Orders that cannot be modified
  const nonModifiableStatuses: string[] = ['completed', 'cancelled', 'ready'];
  if (nonModifiableStatuses.includes(existing.status)) {
    throw new Error(`Cannot modify an order with status "${existing.status}".`);
  }

  // Fetch tenant to get modification threshold
  const tenant = await getTenantById(existing.tenantId);
  if (!tenant) throw new Error(`Tenant ${existing.tenantId} not found`);

  const thresholdMinutes = tenant.orderModificationThreshold ?? 30;
  const minutesElapsed = differenceInMinutes(Date.now(), existing.createdAt);

  if (minutesElapsed > thresholdMinutes) {
    throw new Error(
      `The modification window of ${thresholdMinutes} minutes has passed. ` +
      `Your order can no longer be modified.`,
    );
  }

  // Only one pending modification at a time
  const pending = await getPendingModificationForOrder(input.orderId);
  if (pending) {
    throw new Error('You already have a pending modification request for this order. Please wait for the vendor to review it.');
  }

  const now = Date.now();
  const modificationRecord: CreateOrderModificationRecordDto = {
    id: ulid(),
    orderId: input.orderId,
    tenantId: existing.tenantId,
    requestedChanges: JSON.stringify({
      items: input.items,
      specialInstruction: input.specialInstruction,
    }),
    status: 'pending',
    tenantNote: null,
    createdAt: now,
    reviewedAt: null,
  };

  const modRow = await createOrderModification(modificationRecord);
  const orderRow = await updateOrderModificationStatus(input.orderId, 'pending');

  const order = rowToOrder(orderRow);
  const modification = rowToModification(modRow);

  // Broadcast MODIFICATION_REQUESTED to tenant dashboard
  const tags = [`tenant:${existing.tenantId}`];
  await broadcastToDO(env, existing.tenantId, tags, {
    type: 'MODIFICATION_REQUESTED',
    order,
    modification,
  });

  // Notify the customer session if present
  if (existing.checkoutSessionId) {
    await broadcastToDO(env, `session:${existing.checkoutSessionId}`, [`session:${existing.checkoutSessionId}`], {
      type: 'MODIFICATION_REQUESTED',
      order,
      modification,
    });
  }

  return { order, modification };
}

// ── reviewOrderModification ────────────────────────────────────────────────

/**
 * Tenant accepts or rejects a customer modification request.
 *
 * On acceptance: order items are replaced and total recalculated.
 * On rejection: original order stays intact, tenantNote is recorded.
 */
export async function reviewOrderModification(
  env: Env,
  input: ReviewModificationDto,
  tenantId: string,
): Promise<{ order: Order; modification: OrderModification }> {
  initDb(env);

  const mod = await getModificationById(input.modificationId);
  if (!mod) throw new Error(`Modification ${input.modificationId} not found`);
  if (mod.tenantId !== tenantId) throw new Error('Unauthorized: modification does not belong to your tenant.');
  if (mod.status !== 'pending') throw new Error(`Modification is already "${mod.status}". Cannot review again.`);

  const now = Date.now();

  // ── Accept path ─────────────────────────────────────────────────────
  if (input.action === 'accepted') {
    const parsedChanges = JSON.parse(mod.requestedChanges) as {
      items: Array<{ menuItemId: string; quantity: number }>;
      specialInstruction?: string;
    };

    // Resolve new items & recalculate total
    const resolvedItems = await Promise.all(
      parsedChanges.items.map(async (line) => {
        const menuItem = await getMenuItemById(line.menuItemId);
        if (!menuItem) throw new Error(`Menu item ${line.menuItemId} not found`);
        if (!menuItem.isAvailable) throw new Error(`${menuItem.name} is currently unavailable`);
        return { ...line, unitPrice: menuItem.price };
      }),
    );

    const newTotal = resolvedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    // Replace order items: delete existing, insert new ones
    await deleteOrderItemsByOrderId(mod.orderId);
    await createOrderItems(
      resolvedItems.map((item) => ({
        id: ulid(),
        tenantId,
        orderId: mod.orderId,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        totalPrice: item.unitPrice * item.quantity,
        createdAt: now,
      })),
    );

    // Update order total, special instruction, and clear modificationStatus
    const orderRow = await updateOrderAfterModification(mod.orderId, {
      totalAmount: newTotal,
      specialInstruction: parsedChanges.specialInstruction ?? null,
      modificationStatus: 'accepted',
    });

    const modRow = await updateModificationStatus(input.modificationId, 'accepted', input.tenantNote);
    const order = rowToOrder(orderRow);
    const modification = rowToModification(modRow);

    await _broadcastModificationReviewed(env, order, modification);
    return { order, modification };
  }

  // ── Reject path ─────────────────────────────────────────────────────
  const modRow = await updateModificationStatus(input.modificationId, 'rejected', input.tenantNote);
  const orderRow = await updateOrderModificationStatus(mod.orderId, 'rejected');
  const order = rowToOrder(orderRow);
  const modification = rowToModification(modRow);

  await _broadcastModificationReviewed(env, order, modification);
  return { order, modification };
}

async function _broadcastModificationReviewed(
  env: Env,
  order: Order,
  modification: OrderModification,
): Promise<void> {
  const tenantTags = [`tenant:${order.tenantId}`];
  await broadcastToDO(env, order.tenantId, tenantTags, {
    type: 'MODIFICATION_REVIEWED',
    order,
    modification,
  });

  if (order.checkoutSessionId) {
    await broadcastToDO(env, `session:${order.checkoutSessionId}`, [`session:${order.checkoutSessionId}`], {
      type: 'MODIFICATION_REVIEWED',
      order,
      modification,
    });
  }
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
    totalAmount: row.totalAmount, // Keep in cents - TRPC and broadcast parse it
    specialInstruction: row.specialInstruction ?? null,
    rejectionReason: row.rejectionReason ?? null,
    scheduledFor: row.scheduledFor ?? null,
    delayMinutes: row.delayMinutes ?? 0,
    delayMessage: row.delayMessage ?? null,
    modificationStatus: (row.modificationStatus as Order['modificationStatus']) ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? null,
    completedAt: row.completedAt ?? null,
  };
}

function rowToModification(
  row: typeof import('@nummygo/shared/db/schema').orderModifications.$inferSelect,
): OrderModification {
  return {
    id: row.id,
    orderId: row.orderId,
    tenantId: row.tenantId,
    requestedChanges: row.requestedChanges,
    status: row.status,
    tenantNote: row.tenantNote ?? null,
    createdAt: row.createdAt,
    reviewedAt: row.reviewedAt ?? null,
  };
}

// ── fetchOrderDetails ──────────────────────────────────────────────────────

/**
 * Returns an order + enriched line items + the vendor slug.
 * Used by the modification-mode UX on the storefront to pre-populate the cart.
 */
export async function fetchOrderDetails(
  env: Env,
  orderId: string,
) {
  initDb(env);

  const result = await getOrderWithItems(orderId);
  if (!result) throw new Error(`Order ${orderId} not found`);

  const tenant = await getTenantById(result.order.tenantId);
  if (!tenant) throw new Error(`Tenant for order ${orderId} not found`);

  return {
    order: rowToOrder(result.order),
    items: result.items,
    tenantSlug: tenant.slug,
  };
}// ── fetchModificationDetails ─────────────────────────────────────────

export type DiffEntry = {
  menuItemId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  currentQty: number;   // 0 → newly added
  requestedQty: number; // 0 → being removed
  delta: number;        // requestedQty - currentQty
  change: 'added' | 'removed' | 'increased' | 'decreased';
};

export type EnrichedItem = {
  menuItemId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

/**
 * Returns full modification context for the tenant review dialog:
 * - modification record
 * - currentItems: what the order contains right now
 * - requestedItems: what the customer wants it to contain
 * - diff: items that are actually changing (added / removed / qty changed)
 * - specialInstruction: any note from the customer
 */
export async function fetchModificationDetails(
  env: Env,
  orderId: string,
) {
  initDb(env);

  // 1. Current order + its items
  const orderWithItems = await getOrderWithItems(orderId);
  if (!orderWithItems) throw new Error(`Order ${orderId} not found`);

  // 2. Pending modification
  const mod = await getPendingModificationForOrder(orderId);
  if (!mod) throw new Error(`No pending modification for order ${orderId}`);

  // 3. Parse requested changes
  const parsed = JSON.parse(mod.requestedChanges) as {
    items: Array<{ menuItemId: string; quantity: number }>;
    specialInstruction?: string;
  };

  const requestedItems = Array.isArray(parsed.items) ? parsed.items : [];

  // 4. Batch-fetch menu items for any IDs not already in the current items
  const currentIds = new Set(orderWithItems.items.map(i => i.menuItemId));
  const extraIds = requestedItems.map(i => i.menuItemId).filter(id => !currentIds.has(id));
  const extraMenuItems = await getMenuItemsByIds(extraIds);
  const extraMap = new Map(extraMenuItems.map(m => [
    m.id,
    { name: m.name, price: parseFloat((m.price / 100).toFixed(2)), imageUrl: m.imageUrl },
  ]));

  // Use the already-enriched data from getOrderWithItems for current items
  const currentMap = new Map(orderWithItems.items.map(i => [i.menuItemId, i]));

  // 5. Build requested items (enriched)
  const enrichedRequested: EnrichedItem[] = requestedItems.map(r => {
    const fromCurrent = currentMap.get(r.menuItemId);
    const fromExtra = extraMap.get(r.menuItemId);
    return {
      menuItemId: r.menuItemId,
      name: fromCurrent?.name ?? fromExtra?.name ?? 'Unknown Item',
      price: fromCurrent?.price ?? fromExtra?.price ?? 0,
      imageUrl: fromCurrent?.imageUrl ?? fromExtra?.imageUrl ?? null,
      quantity: r.quantity,
    };
  });

  // 6. Compute diff (only changed items)
  const requestedMap = new Map(requestedItems.map(r => [r.menuItemId, r.quantity]));
  const allIds = new Set([...currentMap.keys(), ...requestedMap.keys()]);

  const diff: DiffEntry[] = [];
  for (const id of allIds) {
    const currentQty = currentMap.get(id)?.quantity ?? 0;
    const requestedQty = requestedMap.get(id) ?? 0;
    if (currentQty === requestedQty) continue; // unchanged

    let change: DiffEntry['change'];
    if (currentQty === 0) change = 'added';
    else if (requestedQty === 0) change = 'removed';
    else if (requestedQty > currentQty) change = 'increased';
    else change = 'decreased';

    const fromCurrent = currentMap.get(id);
    const fromExtra = extraMap.get(id);
    const name = fromCurrent?.name ?? fromExtra?.name ?? 'Unknown Item';
    const price = fromCurrent?.price ?? fromExtra?.price ?? 0;
    const imageUrl = fromCurrent?.imageUrl ?? fromExtra?.imageUrl ?? null;

    diff.push({ menuItemId: id, name, price, imageUrl, currentQty, requestedQty, delta: requestedQty - currentQty, change });
  }

  return {
    modificationId: mod.id,
    tenantNote: mod.tenantNote ?? null,
    specialInstruction: parsed.specialInstruction ?? null,
    currentItems: orderWithItems.items as EnrichedItem[],
    requestedItems: enrichedRequested,
    diff,
  };
}
