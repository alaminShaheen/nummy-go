import { z } from 'zod';
import { ulidSchema } from '../schemas';

export const tenantIdParamSchema = z.object({ tenantId: ulidSchema });
export const orderIdParamSchema = z.object({ orderId: ulidSchema });
export const checkoutSessionIdParamSchema = z.object({ checkoutSessionId: ulidSchema });

export type TenantIdParamDto = z.infer<typeof tenantIdParamSchema>;
export type OrderIdParamDto = z.infer<typeof orderIdParamSchema>;
export type CheckoutSessionIdParamDto = z.infer<typeof checkoutSessionIdParamSchema>;
