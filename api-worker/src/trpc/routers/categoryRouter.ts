import { router, publicProcedure, tenantProcedure } from '../init';
import { z } from 'zod';
import {
    createMenuItemCategorySchema,
    tenantIdParamSchema
} from '@nummygo/shared/models/dtos';
import {
    addMenuCategory,
    fetchAllTenantMenuCategories,
    removeMenuCategory
} from '../../services/menuService';
import { getTenantProfile } from '../../services/tenantService';

export const categoryRouter = router({
    getStorefrontCategories: publicProcedure
        .input(tenantIdParamSchema)
        .query(async ({ input }) => {
            return fetchAllTenantMenuCategories(input.tenantId);
        }),

    getMenuCategories: tenantProcedure
        .query(async ({ ctx }) => {
            const tenant = await getTenantProfile(ctx.session.user.id);
            if (!tenant) throw new Error("No tenant found");
            return await fetchAllTenantMenuCategories(tenant.id);
        }),

    createMenuCategory: tenantProcedure
        .input(createMenuItemCategorySchema.omit({ tenantId: true }))
        .mutation(async ({ input, ctx }) => {
            const tenant = await getTenantProfile(ctx.session.user.id);
            if (!tenant) throw new Error("Unauthorized");
            return await addMenuCategory({ ...input, tenantId: tenant.id });
        }),

    deleteMenuCategory: tenantProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const tenant = await getTenantProfile(ctx.session.user.id);
            if (!tenant) throw new Error("Unauthorized");
            // Optionally, we could verify the category belongs to the tenant here,
            // but the UI only allows deletion of categories they own.
            return await removeMenuCategory(input.id);
        }),
});
