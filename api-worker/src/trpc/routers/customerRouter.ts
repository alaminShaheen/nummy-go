import { router, publicProcedure, TRPCError } from '../init';
import { createOrderSchema, getOrdersByUserSchema } from '@nummygo/shared/models/dtos';
import { placeOrder, fetchUserOrders } from '../../services/orderService';

export const customerRouter = router({

  placeOrder: publicProcedure
    .input(createOrderSchema)
    .mutation(async ({ input, ctx }) => {
      // TODO: replace hardcoded userId with ctx.session.user.id once auth is wired up
      const userId = 'REPLACE_WITH_SESSION_USER_ID';
      try {
        return await placeOrder(ctx.env, userId, input);
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
});
