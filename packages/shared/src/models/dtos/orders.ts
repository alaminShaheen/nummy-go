import { z } from 'zod';
import { orderStatusEnum, paymentMethodEnum, fulfillmentMethodEnum, orderModificationStatusEnum } from '../enums';
import type { OrderStatus } from '../enums';
import {ulidSchema, timestampSchema, priceSchema, outputPriceSchema, userIdSchema} from '../schemas';

// ── API-facing ─────────────────────────────────────────────────────────────

const orderLineSchema = z.object({
  menuItemId: ulidSchema,
  quantity:   z.number().int().min(1),
});

const vendorCartSchema = z.object({
  tenantId:           ulidSchema,
  items:              z.array(orderLineSchema).min(1, 'An order must have at least one item'),
  specialInstruction: z.string().max(500).optional(),
  paymentMethod:      paymentMethodEnum.default('counter'),
  fulfillmentMethod:  fulfillmentMethodEnum.default('pickup'),
  /**
   * Optional scheduled time for the order (ISO-8601 datetime string, e.g. "2026-04-08T14:30:00").
   * Must fall within the tenant's business hours — validated server-side.
   * Null / omitted = ASAP.
   */
  scheduledFor: z.string().datetime({ local: true }).optional(),
});

export const customerCheckoutSchema = z.object({
  cart: z.array(vendorCartSchema).min(1, 'Cart is empty'),
  customerName: z.string().trim().min(1, 'Name is required'),
  customerPhone: z.string().length(10, 'Valid phone required'),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  globalDeliveryAddress: z.string().trim().optional(),
}).refine(
  (data) => {
    const needsDelivery = data.cart.some((c) => c.fulfillmentMethod === 'delivery');
    if (needsDelivery && !data.globalDeliveryAddress) return false;
    return true;
  },
  { message: 'Delivery address is required when delivery is selected', path: ['globalDeliveryAddress'] }
);

export const posCheckoutSchema = z.object({
  items: z.array(orderLineSchema).min(1, 'Cart is empty'),
  specialInstruction: z.string().max(500).optional(),
  paymentMethod: paymentMethodEnum.default('counter'),
  customerName: z.string().trim().optional(),
  customerPhone: z.string().length(10).optional(),
  customerEmail: z.string().email().optional().or(z.literal('')),
});

// ── Status transition map ──────────────────────────────────────────────────

export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:   ['accepted', 'cancelled'],
  accepted:  ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready:     ['completed'],
  completed: [],
  cancelled: [],
};

export const updateOrderStatusSchema = z.object({
  orderId: ulidSchema,
  status:  orderStatusEnum,
  rejectionReason: z.string().trim().min(1, 'Rejection reason is required').max(500).optional(),
}).refine(
  (data) => data.status !== 'cancelled' || !!data.rejectionReason,
  { message: 'Rejection reason is required when cancelling', path: ['rejectionReason'] }
);

export const delayOrderSchema = z.object({
  orderId: ulidSchema,
  delayMinutes: z.number().int().min(1).max(180),
  delayMessage: z.string().trim().max(500).optional(),
});

export const getOrdersByTenantSchema = z.object({
  tenantId: ulidSchema,
  status:   orderStatusEnum.optional(),
  limit:    z.number().int().min(1).max(100).default(50),
  offset:   z.number().int().min(0).default(0),
});

export const getOrdersByUserSchema = z.object({
  userId: userIdSchema,
});

export const getOrderGroupSchema = z.object({
  checkoutSessionId: ulidSchema,
});

// ── Order Modification ─────────────────────────────────────────────────────

/**
 * Customer-facing: request changes to an existing order within the threshold window.
 * Items not listed = keep unchanged.
 */
export const requestOrderModificationSchema = z.object({
  orderId: ulidSchema,
  /** New desired item list (replaces the full order items on acceptance). */
  items: z.array(orderLineSchema).min(1, 'Must have at least one item'),
  specialInstruction: z.string().max(500).optional(),
});

/** Tenant-facing: accept or reject a pending modification request. */
export const reviewModificationSchema = z.object({
  modificationId: ulidSchema,
  action: z.enum(['accepted', 'rejected']),
  tenantNote: z.string().optional(),
});

export const cancelOrderRequestSchema = z.object({
  orderId: ulidSchema,
  reason: z.string().optional(),
});

// ── Internal (query-facing) ────────────────────────────────────────────────

export const createOrderRecordSchema = z.object({
  id:                 ulidSchema,
  userId:             userIdSchema.nullable().optional(),
  checkoutSessionId:  ulidSchema.optional(),
  tenantId:           ulidSchema,
  customerName:       z.string().nullable().optional(),
  customerPhone:      z.string().nullable().optional(),
  customerEmail:      z.string().nullable().optional(),
  totalAmount:        priceSchema,
  paymentMethod:      paymentMethodEnum,
  fulfillmentMethod:  fulfillmentMethodEnum,
  deliveryAddress:    z.string().nullable().optional(),
  isPosOrder:         z.boolean().default(false),
  specialInstruction: z.string().nullable().optional(),
  rejectionReason:    z.string().nullable().optional(),
  scheduledFor:       timestampSchema.nullable().optional(),
  modificationStatus: orderModificationStatusEnum.nullable().optional(),
  createdAt:          timestampSchema,
  updatedAt:          timestampSchema,
});

export const createOrderItemRecordSchema = z.object({
  id:         ulidSchema,
  orderId:    ulidSchema,
  tenantId:   ulidSchema,
  menuItemId: ulidSchema,
  quantity:   z.number().int().positive(),
  totalPrice: priceSchema,
  createdAt:  timestampSchema,
});

export const createOrderModificationRecordSchema = z.object({
  id:               ulidSchema,
  orderId:          ulidSchema,
  tenantId:         ulidSchema,
  requestedChanges: z.string(), // JSON string
  status:           orderModificationStatusEnum.default('pending'),
  tenantNote:       z.string().nullable().optional(),
  createdAt:        timestampSchema,
  reviewedAt:       timestampSchema.nullable().optional(),
});

export const orderResponseSchema = z.object({
  id:                 ulidSchema,
  userId:             userIdSchema.nullable(),
  checkoutSessionId:  ulidSchema.nullable(),
  tenantId:           ulidSchema,
  customerName:       z.string().nullable(),
  customerPhone:      z.string().nullable(),
  customerEmail:      z.string().nullable(),
  status:             orderStatusEnum,
  totalAmount:        outputPriceSchema,
  paymentMethod:      paymentMethodEnum,
  fulfillmentMethod:  fulfillmentMethodEnum,
  deliveryAddress:    z.string().nullable(),
  isPosOrder:         z.boolean(),
  specialInstruction: z.string().nullable(),
  rejectionReason:    z.string().nullable(),
  scheduledFor:       timestampSchema.nullable(),
  delayMinutes:       z.number(),
  delayMessage:       z.string().nullable(),
  modificationStatus: orderModificationStatusEnum.nullable(),
  createdAt:          timestampSchema,
  updatedAt:          timestampSchema.nullable(),
  completedAt:        timestampSchema.nullable(),
});

export const vendorInfoSchema = z.object({
  name: z.string(),
  slug: z.string(),
  phoneNumber: z.string(),
  logoUrl: z.string().nullable(),
  address: z.string().nullable(),
  modificationThreshold: z.number().int().nonnegative(),
});

export const checkoutGroupResponseSchema = z.object({
  orders: z.array(orderResponseSchema.extend({
    items: z.array(z.object({
      menuItemId: z.string(),
      name: z.string(),
      price: z.number(),
      imageUrl: z.string().nullable().optional(),
      quantity: z.number().int().positive(),
    })).optional(),
  })),
  tenantModificationThreshold: z.number().int().nonnegative(),
  vendorInfo: z.record(z.string(), vendorInfoSchema),
});

export const orderModificationResponseSchema = z.object({
  id:               ulidSchema,
  orderId:          ulidSchema,
  tenantId:         ulidSchema,
  requestedChanges: z.string(),
  status:           orderModificationStatusEnum,
  tenantNote:       z.string().nullable(),
  createdAt:        timestampSchema,
  reviewedAt:       timestampSchema.nullable(),
});

export const modificationDetailsResponseSchema = z.object({
  modificationId: z.string(),
  tenantNote: z.string().nullable(),
  specialInstruction: z.string().nullable(),
  currentItems: z.array(z.object({
    menuItemId: z.string(),
    name: z.string(),
    price: z.number(),
    imageUrl: z.string().nullable(),
    quantity: z.number().int().positive(),
  })),
  requestedItems: z.array(z.object({
    menuItemId: z.string(),
    name: z.string(),
    price: z.number(),
    imageUrl: z.string().nullable(),
    quantity: z.number().int().positive(),
  })),
  diff: z.array(z.object({
    menuItemId: z.string(),
    name: z.string(),
    price: z.number(),
    imageUrl: z.string().nullable(),
    currentQty: z.number().int().min(0),
    requestedQty: z.number().int().min(0),
    delta: z.number().int(),
    change: z.enum(['added', 'removed', 'increased', 'decreased']),
  })),
});

export type CustomerCheckoutDto                  = z.infer<typeof customerCheckoutSchema>;
export type PosCheckoutDto                       = z.infer<typeof posCheckoutSchema>;
export type UpdateOrderStatusDto                 = z.infer<typeof updateOrderStatusSchema>;
export type GetOrdersByTenantDto                 = z.infer<typeof getOrdersByTenantSchema>;
export type GetOrdersByUserDto                   = z.infer<typeof getOrdersByUserSchema>;
export type CreateOrderRecordDto                 = z.infer<typeof createOrderRecordSchema>;
export type CreateOrderItemRecordDto             = z.infer<typeof createOrderItemRecordSchema>;
export type CreateOrderModificationRecordDto     = z.infer<typeof createOrderModificationRecordSchema>;
export type GetOrderGroupDto                     = z.infer<typeof getOrderGroupSchema>;
export type OrderResponseDto                     = z.infer<typeof orderResponseSchema>;
export type CheckoutGroupResponseDto             = z.infer<typeof checkoutGroupResponseSchema>;
export type OrderModificationResponseDto         = z.infer<typeof orderModificationResponseSchema>;
export type RequestOrderModificationDto          = z.infer<typeof requestOrderModificationSchema>;
export type ReviewModificationDto                = z.infer<typeof reviewModificationSchema>;
export type CancelOrderRequestDto                = z.infer<typeof cancelOrderRequestSchema>;
export type ModificationDetailsResponseDto       = z.infer<typeof modificationDetailsResponseSchema>;
