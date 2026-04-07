import { z } from 'zod';
import { orderStatusEnum, paymentMethodEnum, fulfillmentMethodEnum } from '../enums';
import type { OrderStatus } from '../enums';
import {ulidSchema, timestampSchema, priceSchema, outputPriceSchema} from '../schemas';

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

export const getOrdersByTenantSchema = z.object({
  tenantId: ulidSchema,
  status:   orderStatusEnum.optional(),
  limit:    z.number().int().min(1).max(100).default(50),
  offset:   z.number().int().min(0).default(0),
});

export const getOrdersByUserSchema = z.object({
  userId: ulidSchema,
});

export const getOrderGroupSchema = z.object({
  checkoutSessionId: ulidSchema,
});

// ── Internal (query-facing) ────────────────────────────────────────────────

export const createOrderRecordSchema = z.object({
  id:                 ulidSchema,
  userId:             ulidSchema.nullable().optional(),
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
  rejectionReason: z.string().nullable().optional(),
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

export const orderResponseSchema = z.object({
  id:                 ulidSchema,
  userId:             ulidSchema.nullable(),
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
  createdAt:          timestampSchema,
  updatedAt:          timestampSchema.nullable(),
  completedAt:        timestampSchema.nullable(),
});

export type CustomerCheckoutDto      = z.infer<typeof customerCheckoutSchema>;
export type PosCheckoutDto           = z.infer<typeof posCheckoutSchema>;
export type UpdateOrderStatusDto     = z.infer<typeof updateOrderStatusSchema>;
export type GetOrdersByTenantDto     = z.infer<typeof getOrdersByTenantSchema>;
export type GetOrdersByUserDto       = z.infer<typeof getOrdersByUserSchema>;
export type CreateOrderRecordDto     = z.infer<typeof createOrderRecordSchema>;
export type CreateOrderItemRecordDto = z.infer<typeof createOrderItemRecordSchema>;
export type GetOrderGroupDto         = z.infer<typeof getOrderGroupSchema>;
export type OrderResponseDto         = z.infer<typeof orderResponseSchema>;
