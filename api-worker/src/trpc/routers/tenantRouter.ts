import { router, tenantProcedure, TRPCError } from '../init';
import { getOrdersByTenantSchema, updateOrderStatusSchema } from '@nummygo/shared/models/dtos';
import { fetchTenantOrders, changeOrderStatus } from '../../services/orderService';

export const tenantRouter = router({

  getDashboardOrders: tenantProcedure
    .input(getOrdersByTenantSchema)
    .query(async ({ input, ctx }) => {
      try {
        return await fetchTenantOrders(ctx.env, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch orders',
        });
      }
    }),

  updateOrderStatus: tenantProcedure
    .input(updateOrderStatusSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await changeOrderStatus(ctx.env, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update order status',
        });
      }
    }),
});
