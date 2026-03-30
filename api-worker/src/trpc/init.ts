/**
 * api-worker/src/trpc/init.ts
 *
 * tRPC initialisation.
 *
 * Creates the `t` builder bound to our Context type.
 * All routers import `router` and `publicProcedure` from this file.
 *
 * Extend this file to add:
 *  - Middleware (auth, logging, rate-limiting)
 *  - Protected procedures (e.g. tenantProcedure that checks a JWT)
 */

import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';

// Initialise tRPC with our context type.
// We do NOT use superjson here because Cloudflare Workers handle
// serialisation natively – plain JSON is simpler and faster.
const t = initTRPC.context<Context>().create();

/** Router constructor. */
export const router = t.router;

/** Public procedure – no authentication required. */
export const publicProcedure = t.procedure;

/**
 * Tenant-authenticated procedure (starter placeholder).
 *
 * In production you would verify a JWT in the Authorization header here.
 * For now it's identical to publicProcedure.
 *
 * Example production middleware:
 *   .use(async ({ ctx, next }) => {
 *     const token = ctx.req.headers.get('Authorization')?.replace('Bearer ', '');
 *     if (!token) throw new TRPCError({ code: 'UNAUTHORIZED' });
 *     const payload = await verifyJwt(token, ctx.env.JWT_SECRET);
 *     return next({ ctx: { ...ctx, tenantId: payload.sub } });
 *   });
 */
export const tenantProcedure = t.procedure;

/** Re-export TRPCError for use in routers. */
export { TRPCError };
