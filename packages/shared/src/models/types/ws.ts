import { z } from 'zod';
import { orderSchema } from './order';

export const wsMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ORDER_CREATED'), order: orderSchema }),
  z.object({ type: z.literal('ORDER_UPDATED'), order: orderSchema }),
  z.object({ type: z.literal('PING') }),
]);

export type WsMessage = z.infer<typeof wsMessageSchema>;
