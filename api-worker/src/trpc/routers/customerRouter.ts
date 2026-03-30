/**
 * api-worker/src/trpc/routers/customerRouter.ts
 *
 * tRPC procedures callable by the customer-web frontend.
 *
 * Procedures:
 *  - placeOrder  – Create a new order and broadcast to the tenant's DO group.
 *  - getOrders   – Fetch all orders placed by a given customer.
 *
 * Design principle:
 *  Routers are thin. They validate input (via Zod input schemas),
 *  delegate all business logic to the orderService, and return results.
 */

import { router, publicProcedure, TRPCError } from '../init';
import { createOrderSchema, getOrdersSchema } from '@nummygo/shared/schemas';
import { placeOrder, fetchCustomerOrders } from '../../services/orderService';

export const customerRouter = router({

  // ── placeOrder ───────────────────────────────────────────────────────────
  /**
   * Place a new order.
   *
   * Flow:
   *  1. Validate input via createOrderSchema.
   *  2. Persist order to D1 via orderService.
   *  3. Broadcast ORDER_CREATED event to the tenant's Durable Object group.
   *  4. Return the created order.
   */
  placeOrder: publicProcedure
    .input(createOrderSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const order = await placeOrder(ctx.env, input);
        return order;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to place order',
        });
      }
    }),

  // ── getOrders ────────────────────────────────────────────────────────────
  /**
   * Get all orders for a customer.
   * Returns an array of Order objects, sorted newest first.
   */
  getOrders: publicProcedure
    .input(getOrdersSchema)
    .query(async ({ input, ctx }) => {
      try {
        return fetchCustomerOrders(ctx.env, input.customerId);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch orders',
        });
      }
    }),
});
