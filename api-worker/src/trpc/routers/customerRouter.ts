import { router, publicProcedure, protectedProcedure, TRPCError } from '../init';
import { customerCheckoutSchema, getOrdersByUserSchema, getOrderGroupSchema, orderResponseSchema } from '@nummygo/shared/models/dtos';
import { placeCheckoutOrder, fetchUserOrders, fetchCheckoutSession } from '../../services/orderService';
import { z } from 'zod';

export const customerRouter = router({

  checkout: publicProcedure
    .input(customerCheckoutSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.session?.user?.id ?? null;
        return await placeCheckoutOrder(ctx.env, input, userId);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to place order',
        });
      }
    }),

  getOrders: protectedProcedure
    .output(z.array(orderResponseSchema))
    .query(async ({ ctx }) => {
      try {
        return await fetchUserOrders(ctx.env, ctx.session.user.id);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch orders',
        });
      }
    }),

  getCheckoutGroup: publicProcedure
    .input(z.object({ checkoutSessionId: z.string() }))
    .output(z.array(orderResponseSchema))
    .query(async ({ input, ctx }) => {
      try {
        return await fetchCheckoutSession(ctx.env, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch tracking session',
        });
      }
    }),
});
