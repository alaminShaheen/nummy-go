const { z } = require('zod');

const timestampSchema = z.number().int().positive();
const priceSchema = z.number().int().positive();
const outputPriceSchema = z.number().transform((val) => parseFloat((val / 100).toFixed(2)));

const orderStatusEnum = z.enum(['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled']);
const paymentMethodEnum = z.enum(['counter', 'card', 'crypto']);
const fulfillmentMethodEnum = z.enum(['pickup', 'delivery', 'dine_in']);
const orderModificationStatusEnum = z.enum(['pending', 'accepted', 'rejected']);

const orderResponseSchema = z.object({
  id:                 z.string(),
  userId:             z.string().nullable(),
  checkoutSessionId:  z.string().nullable(),
  tenantId:           z.string(),
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
  modificationStatus: orderModificationStatusEnum.nullable(),
  createdAt:          timestampSchema,
  updatedAt:          timestampSchema.nullable(),
  completedAt:        timestampSchema.nullable(),
});

const mockOrder = {
    id: "01HQXZ3V9PXTZ76VW6VQFJ0F41",
    userId: null,
    tenantId: "01HQXZ3V9PXTZ76VW6VQFJ0F41",
    checkoutSessionId: null,
    customerName: null,
    customerPhone: null,
    customerEmail: null,
    status: 'pending',
    paymentMethod: 'counter',
    fulfillmentMethod: 'pickup',
    deliveryAddress: null,
    isPosOrder: false,
    totalAmount: 1550, 
    specialInstruction: null,
    rejectionReason: null,
    scheduledFor: null,
    modificationStatus: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    completedAt: null,
};

try {
    orderResponseSchema.parse(mockOrder);
    console.log("Success");
} catch(e) {
    console.error(JSON.stringify(e.errors, null, 2));
}
