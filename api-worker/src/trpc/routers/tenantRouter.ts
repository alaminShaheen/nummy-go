import { protectedProcedure, publicProcedure, router } from '../init';
import {
    checkTenantSlugSchema,
    registerTenantSchema,
    updateTenantSchema,
    searchTenantsSchema,
} from '@nummygo/shared/models/dtos';
import { completeTenantOnboarding, getTenantProfile, updateTenantInformation } from '../../services/tenantService';
import { getAllTenantSlugs, getTenantBySlug, searchTenantsByName } from '@nummygo/shared/db/queries';

export const tenantRouter = router({
    // ── General ───────────────────────────────────────────────────────────
    allTenantSlugs: publicProcedure.query(async () => {
        return await getAllTenantSlugs();
    }),

    searchTenants: publicProcedure
        .input(searchTenantsSchema)
        .query(async ({ input }) => {
            return searchTenantsByName(input.query, input.limit);
        }),

    // ── Onboarding & Profile ──────────────────────────────────────────────────

    me: protectedProcedure.query(async ({ ctx }) => {
        return getTenantProfile(ctx.session.user.id);
    }),

    getTenantBySlug: publicProcedure.input(checkTenantSlugSchema).query(async ({ input }) => {
        return getTenantBySlug(input.slug);
    }),

    checkSlug: protectedProcedure
        .input(checkTenantSlugSchema)
        .query(async ({ input, ctx }) => {
            const existing = await getTenantBySlug(input.slug);
            if (!existing || existing.userId === ctx.session.user.id) {
                return { available: true }
            }

        return { available: false };
    }),

    onboard: protectedProcedure.input(registerTenantSchema).mutation(async ({ input, ctx }) => {
        return await completeTenantOnboarding(ctx.session.user.id, input);
    }),

    updateTenant: protectedProcedure.input(updateTenantSchema).mutation(async ({ input, ctx }) => {
        return await updateTenantInformation(ctx.session.user.id, input);
    }),
});
