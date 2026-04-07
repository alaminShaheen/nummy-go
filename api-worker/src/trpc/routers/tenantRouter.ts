import { protectedProcedure, publicProcedure, router, tenantProcedure } from '../init';
import {
	checkTenantSlugSchema,
	getOrdersByTenantSchema,
	registerTenantSchema,
	updateOrderStatusSchema,
	updateTenantSchema,
    searchTenantsSchema,
    createMenuItemSchema,
    updateMenuItemSchema,
    deleteMenuItemSchema,
    createMenuItemCategorySchema,
    posCheckoutSchema,
} from '@nummygo/shared/models/dtos';
import { changeOrderStatus, fetchTenantOrders, placePosOrder } from '../../services/orderService';
import { completeTenantOnboarding, getTenantProfile, updateTenantInformation } from '../../services/tenantService';
import { addMenuItem, editMenuItem, fetchAllTenantMenuItems, removeMenuItem, fetchStorefrontMenu, addMenuCategory, fetchAllTenantMenuCategories } from '../../services/menuService';
import { getAllTenantSlugs, getTenantBySlug, searchTenantsByName } from '@nummygo/shared/db/queries';
import { z, ZodError } from 'zod';

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

    // ── Onboarding ───────────────────────────────────────────────────────────

	me: protectedProcedure.query(async ({ ctx }) => {
		return getTenantProfile(ctx.session.user.id);
	}),

	getTenantBySlug: publicProcedure.input(checkTenantSlugSchema).query(async ({ input }) => {
		return getTenantBySlug(input.slug);
	}),

    getStorefrontMenu: publicProcedure
        .input(z.object({ tenantId: z.string() }))
        .query(async ({ input }) => {
            return fetchStorefrontMenu(input.tenantId);
        }),

    getStorefrontCategories: publicProcedure
        .input(z.object({ tenantId: z.string() }))
        .query(async ({ input }) => {
            return fetchAllTenantMenuCategories(input.tenantId);
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

	// ── Dashboard ────────────────────────────────────────────────────────────

	getDashboardOrders: tenantProcedure.input(getOrdersByTenantSchema).query(async ({ input, ctx }) => {
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

    // ── Menu Management ────────────────────────────────────────────────────────

    getMenuItems: tenantProcedure
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
        .input(updateMenuItemSchema.extend({ id: z.string() })) // using a string ID (ULID)
        .mutation(async ({ input, ctx }) => {
            const { id, ...data } = input;
            // ideally we would check if the item belongs to the tenant here
            return await editMenuItem(id, data);
        }),

    deleteMenuItem: tenantProcedure
        .input(deleteMenuItemSchema)
        .mutation(async ({ input, ctx }) => {
            // ideally we would check if the item belongs to the tenant here
            return await removeMenuItem(input.id);
        }),

    // ── Categories ─────────────────────────────────────────────────────────────

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
});
