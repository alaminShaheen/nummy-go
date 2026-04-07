import { z } from 'zod';
import { orderStatusEnum, paymentMethodEnum } from '../enums';
import {ulidSchema, timestampSchema, priceSchema} from '../schemas';

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
});

export const customerCheckoutSchema = z.object({
  cart: z.array(vendorCartSchema).min(1, 'Cart is empty'),
  customerName: z.string().trim().min(1, 'Name is required'),
  customerPhone: z.string().length(10, 'Valid phone required'),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
});

export const posCheckoutSchema = z.object({
  items: z.array(orderLineSchema).min(1, 'Cart is empty'),
  specialInstruction: z.string().max(500).optional(),
  paymentMethod: paymentMethodEnum.default('counter'),
  customerName: z.string().trim().optional(),
  customerPhone: z.string().length(10).optional(),
  customerEmail: z.string().email().optional().or(z.literal('')),
});

export const updateOrderStatusSchema = z.object({
  orderId: ulidSchema,
  status:  orderStatusEnum,
});

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
  isPosOrder:         z.boolean().default(false),
  specialInstruction: z.string().nullable().optional(),
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

export type CustomerCheckoutDto      = z.infer<typeof customerCheckoutSchema>;
export type PosCheckoutDto           = z.infer<typeof posCheckoutSchema>;
export type UpdateOrderStatusDto     = z.infer<typeof updateOrderStatusSchema>;
export type GetOrdersByTenantDto     = z.infer<typeof getOrdersByTenantSchema>;
export type GetOrdersByUserDto       = z.infer<typeof getOrdersByUserSchema>;
export type CreateOrderRecordDto     = z.infer<typeof createOrderRecordSchema>;
export type CreateOrderItemRecordDto = z.infer<typeof createOrderItemRecordSchema>;
export type GetOrderGroupDto         = z.infer<typeof getOrderGroupSchema>;
