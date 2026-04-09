import { router, publicProcedure, tenantProcedure } from '../init';
import {
    createMenuItemSchema,
    updateMenuItemRequestSchema,
    deleteMenuItemSchema,
    menuItemResponseSchema,
    tenantIdParamSchema
} from '@nummygo/shared/models/dtos';
import {
    addMenuItem,
    editMenuItem,
    fetchAllTenantMenuItems,
    removeMenuItem,
    fetchStorefrontMenu
} from '../../services/menuService';
import { getTenantProfile } from '../../services/tenantService';
import { z } from 'zod';

export const menuRouter = router({
    getStorefrontMenu: publicProcedure
        .input(tenantIdParamSchema)
        .output(z.array(menuItemResponseSchema))
        .query(async ({ input }) => {
            return fetchStorefrontMenu(input.tenantId);
        }),

    getMenuItems: tenantProcedure
        .output(z.array(menuItemResponseSchema))
        .query(async ({ ctx }) => {
            const tenant = await getTenantProfile(ctx.session.user.id);
            if (!tenant) throw new Error("No tenant found");
            return await fetchAllTenantMenuItems(tenant.id);
        }),

    createMenuItem: tenantProcedure
        .input(createMenuItemSchema.omit({ tenantId: true }))
        .mutation(async ({ input, ctx }) => {
            const tenant = await getTenantProfile(ctx.session.user.id);
            if (!tenant) throw new Error("Unauthorized");
            return await addMenuItem({ ...input, tenantId: tenant.id });
        }),

    updateMenuItem: tenantProcedure
        .input(updateMenuItemRequestSchema)
        .mutation(async ({ input, ctx }) => {
            const { id, ...data } = input;
            return await editMenuItem(id, data);
        }),

    deleteMenuItem: tenantProcedure
        .input(deleteMenuItemSchema)
        .mutation(async ({ input, ctx }) => {
            return await removeMenuItem(input.id);
        }),
});
