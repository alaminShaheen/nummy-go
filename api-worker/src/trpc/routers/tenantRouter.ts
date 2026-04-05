import {protectedProcedure, publicProcedure, router, tenantProcedure} from '../init';
import {
    checkTenantSlugSchema,
    getOrdersByTenantSchema,
    registerTenantSchema,
    updateOrderStatusSchema,
} from '@nummygo/shared/models/dtos';
import {changeOrderStatus, fetchTenantOrders} from '../../services/orderService';
import {completeTenantOnboarding, getTenantProfile} from '../../services/tenantService';
import {getAllTenantSlugs, getTenantBySlug} from '@nummygo/shared/db/queries';
import {ZodError} from "zod";

export const tenantRouter = router({
    // ── General ───────────────────────────────────────────────────────────
    allTenantSlugs: publicProcedure.query(async () => {
        return await getAllTenantSlugs();
    }),

    // ── Onboarding ───────────────────────────────────────────────────────────

    me: protectedProcedure.query(async ({ctx}) => {
        return getTenantProfile(ctx.session.user.id);
    }),

    getTenantBySlug: publicProcedure
        .input(checkTenantSlugSchema)
        .query(async ({input}) => {
            return getTenantBySlug(input.slug);
        }),

    checkSlug: protectedProcedure
        .input(checkTenantSlugSchema)
        .query(async ({input, ctx}) => {
            const existing = await getTenantBySlug(input.slug);
            if (!existing || existing.userId === ctx.session.user.id) {
                return {available: true}
            }

            return {available: false};
        }),

    onboard: protectedProcedure
        .input(registerTenantSchema)
        .mutation(async ({input, ctx}) => {
            throw new ZodError([{
                code: "custom",
                path: ["slug"],
                message: "Slug is not available"
            }])
            return await completeTenantOnboarding(ctx.session.user.id, input);
        }),

    // ── Dashboard ────────────────────────────────────────────────────────────

    getDashboardOrders: tenantProcedure
        .input(getOrdersByTenantSchema)
        .query(async ({input, ctx}) => {
            return await fetchTenantOrders(ctx.env, input);
        }),

    updateOrderStatus: tenantProcedure
        .input(updateOrderStatusSchema)
        .mutation(async ({input, ctx}) => {
            return await changeOrderStatus(ctx.env, input);
        }),
});
