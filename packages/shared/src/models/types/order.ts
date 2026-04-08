import { z } from 'zod';
import { orderStatusEnum, paymentMethodEnum, fulfillmentMethodEnum, orderModificationStatusEnum } from '../enums';
import { ulidSchema, timestampSchema } from '../schemas';

export const orderItemSchema = z.object({
  id:         ulidSchema,
  tenantId:   ulidSchema,
  orderId:    ulidSchema,
  menuItemId: ulidSchema,
  quantity:   z.number().int().positive(),
  totalPrice: z.number().int().positive(),
  createdAt:  timestampSchema,
});

export const orderSchema = z.object({
  id:                  ulidSchema,
  userId:              ulidSchema.nullable(),
  tenantId:            ulidSchema,
  checkoutSessionId:   ulidSchema.nullable(),
  customerName:        z.string().nullable(),
  customerPhone:       z.string().nullable(),
  customerEmail:       z.string().nullable(),
  status:              orderStatusEnum,
  paymentMethod:       paymentMethodEnum,
  fulfillmentMethod:   fulfillmentMethodEnum,
  deliveryAddress:     z.string().nullable(),
  isPosOrder:          z.boolean(),
  totalAmount:         z.number().int().positive(),
  specialInstruction:  z.string().nullable(),
  rejectionReason:     z.string().nullable(),
  /** Unix ms timestamp of when the order should be ready / delivered. Null = ASAP. */
  scheduledFor:        timestampSchema.nullable(),
  /** Tracks the latest pending/accepted/rejected customer modification request. */
  modificationStatus:  orderModificationStatusEnum.nullable(),
  createdAt:           timestampSchema,
  updatedAt:           timestampSchema.nullable(),
  completedAt:         timestampSchema.nullable(),
});

/** Shape stored/retrieved from the order_modifications table. */
export const orderModificationSchema = z.object({
  id:               ulidSchema,
  orderId:          ulidSchema,
  tenantId:         ulidSchema,
  /** JSON string — parse to OrderModificationPayload */
  requestedChanges: z.string(),
  status:           orderModificationStatusEnum,
  tenantNote:       z.string().nullable(),
  createdAt:        timestampSchema,
  reviewedAt:       timestampSchema.nullable(),
});

export type OrderItem         = z.infer<typeof orderItemSchema>;
export type Order             = z.infer<typeof orderSchema>;
export type OrderModification = z.infer<typeof orderModificationSchema>;
