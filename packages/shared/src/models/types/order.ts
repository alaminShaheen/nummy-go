import { z } from 'zod';
import { orderStatusEnum } from '../enums';
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
  id:                 ulidSchema,
  userId:             ulidSchema,
  tenantId:           ulidSchema,
  status:             orderStatusEnum,
  totalAmount:        z.number().int().positive(),
  specialInstruction: z.string().nullable(),
  createdAt:          timestampSchema,
  updatedAt:          timestampSchema.nullable(),
  completedAt:        timestampSchema.nullable(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order     = z.infer<typeof orderSchema>;
