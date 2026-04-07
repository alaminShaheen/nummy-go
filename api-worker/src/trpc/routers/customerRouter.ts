import { router, publicProcedure, TRPCError } from '../init';
import { customerCheckoutSchema, getOrdersByUserSchema, getOrderGroupSchema } from '@nummygo/shared/models/dtos';
import { placeCheckoutOrder, fetchUserOrders, fetchCheckoutSession } from '../../services/orderService';

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

  getOrders: publicProcedure
    .input(getOrdersByUserSchema)
    .query(async ({ input, ctx }) => {
      try {
        return await fetchUserOrders(ctx.env, input.userId);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch orders',
        });
      }
    }),

  getCheckoutGroup: publicProcedure
    .input(getOrderGroupSchema)
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
