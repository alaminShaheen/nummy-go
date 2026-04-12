import { router, publicProcedure, protectedProcedure, tenantProcedure, TRPCError } from '../init';
import {
    getOrdersByTenantSchema,
    updateOrderStatusSchema,
    posCheckoutSchema,
    orderResponseSchema,
    reviewModificationSchema,
    orderModificationResponseSchema,
    modificationDetailsResponseSchema,
    customerCheckoutSchema,
    requestOrderModificationSchema,
    orderIdParamSchema,
    checkoutSessionIdParamSchema,
    checkoutGroupResponseSchema,
    cancelOrderRequestSchema,
    delayOrderSchema
} from '@nummygo/shared/models/dtos';
import {
    changeOrderStatus,
    fetchTenantOrders,
    placePosOrder,
    reviewOrderModification,
    fetchModificationDetails,
    placeCheckoutOrder,
    fetchUserOrders,
    fetchCheckoutSession,
    requestOrderModification,
    fetchOrderDetails,
    cancelOrderAsCustomer,
    delayOrder
} from '../../services/orderService';
import { getTenantProfile } from '../../services/tenantService';
import { z } from 'zod';

export const orderRouter = router({
    // ── Customer Procedures ──────────────────────────────────────────────────

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

    getCustomerOrders: protectedProcedure
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
        .input(checkoutSessionIdParamSchema)
        .output(checkoutGroupResponseSchema)
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

    requestModification: publicProcedure
        .input(requestOrderModificationSchema)
        .output(z.object({
            order: orderResponseSchema,
            modification: orderModificationResponseSchema,
        }))
        .mutation(async ({ input, ctx }) => {
            try {
                const userId = ctx.session?.user?.id ?? null;
                return await requestOrderModification(ctx.env, input, userId);
            } catch (error) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: error instanceof Error ? error.message : 'Failed to request modification',
                });
            }
        }),

    customerCancel: publicProcedure
        .input(cancelOrderRequestSchema)
        .output(orderResponseSchema)
        .mutation(async ({ input, ctx }) => {
            try {
                const userId = ctx.session?.user?.id ?? null;
                return await cancelOrderAsCustomer(ctx.env, input, userId);
            } catch (error) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: error instanceof Error ? error.message : 'Cancellation failed',
                });
            }
        }),

    getOrderDetails: publicProcedure
        .input(orderIdParamSchema)
        .output(z.object({
            order: orderResponseSchema,
            items: z.array(z.object({
                menuItemId: z.string(),
                name: z.string(),
                price: z.number(),
                imageUrl: z.string().nullable(),
                quantity: z.number().int().positive(),
            })),
            tenantSlug: z.string(),
        }))
        .query(async ({ input, ctx }) => {
            try {
                return await fetchOrderDetails(ctx.env, input.orderId);
            } catch (error) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: error instanceof Error ? error.message : 'Order not found',
                });
            }
        }),

    // ── Tenant Procedures ────────────────────────────────────────────────────

    getDashboardOrders: tenantProcedure
        .input(getOrdersByTenantSchema)
        .output(z.array(orderResponseSchema))
        .query(async ({ input, ctx }) => {
            return await fetchTenantOrders(ctx.env, input);
        }),

    createPosOrder: tenantProcedure
        .input(posCheckoutSchema)
        .mutation(async ({ input, ctx }) => {
            const tenant = await getTenantProfile(ctx.session.user.id);
            if (!tenant) throw new Error("No tenant found");
            return await placePosOrder(ctx.env, tenant.id, input);
        }),

    updateOrderStatus: tenantProcedure
        .input(updateOrderStatusSchema)
        .mutation(async ({ input, ctx }) => {
            return await changeOrderStatus(ctx.env, input);
        }),

    delayOrder: tenantProcedure
        .input(delayOrderSchema)
        .mutation(async ({ input, ctx }) => {
            return await delayOrder(ctx.env, input);
        }),

    reviewModification: tenantProcedure
        .input(reviewModificationSchema)
        .output(z.object({
            order: orderResponseSchema,
            modification: orderModificationResponseSchema,
        }))
        .mutation(async ({ input, ctx }) => {
            const tenant = await getTenantProfile(ctx.session.user.id);
            if (!tenant) throw new Error("No tenant found");
            return await reviewOrderModification(ctx.env, input, tenant.id);
        }),

    getModificationDetails: tenantProcedure
        .input(orderIdParamSchema)
        .output(modificationDetailsResponseSchema)
        .query(async ({ input, ctx }) => {
            try {
                return await fetchModificationDetails(ctx.env, input.orderId);
            } catch (error) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: error instanceof Error ? error.message : 'Modification details not found',
                });
            }
        }),
});
