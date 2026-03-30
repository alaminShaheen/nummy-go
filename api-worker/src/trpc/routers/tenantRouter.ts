/**
 * api-worker/src/trpc/routers/tenantRouter.ts
 *
 * tRPC procedures callable by the tenant-web dashboard.
 *
 * Procedures:
 *  - getDashboardOrders  – Fetch incoming orders for a tenant's dashboard.
 *  - updateOrderStatus   – Accept / reject / complete an order.
 *
 * In production, wrap these in `tenantProcedure` (see init.ts) to
 * ensure only authenticated tenants can call them.
 */

import { router, tenantProcedure, TRPCError } from '../init';
import {
  getDashboardOrdersSchema,
  updateOrderSchema,
} from '@nummygo/shared/schemas';
import {
  fetchTenantOrders,
  changeOrderStatus,
} from '../../services/orderService';

export const tenantRouter = router({

  // ── getDashboardOrders ───────────────────────────────────────────────────
  /**
   * Fetch all orders for a tenant, optionally filtered by status.
   * The tenant dashboard polls this on mount; real-time updates come via WS.
   */
  getDashboardOrders: tenantProcedure
    .input(getDashboardOrdersSchema)
    .query(async ({ input, ctx }) => {
      try {
        return fetchTenantOrders(ctx.env, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch dashboard orders',
        });
      }
    }),

  // ── updateOrderStatus ────────────────────────────────────────────────────
  /**
   * Update an order's status and broadcast the change to connected clients.
   *
   * Flow:
   *  1. Validate input via updateOrderSchema.
   *  2. Persist new status to D1.
   *  3. Broadcast ORDER_UPDATED event to the tenant's DO group.
   *  4. Return updated order.
   */
  updateOrderStatus: tenantProcedure
    .input(updateOrderSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return changeOrderStatus(ctx.env, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update order status',
        });
      }
    }),
});
