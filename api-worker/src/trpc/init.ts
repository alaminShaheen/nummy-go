import {initTRPC, TRPCError} from '@trpc/server';
import type {Context} from './context';
import {createErrorHandlingMiddleware} from '../middlewares/errorHandlingMiddleware';

export const t = initTRPC.context<Context>().create();

export const router = t.router;

const errorHandlingMiddleware = createErrorHandlingMiddleware(t);

/** No authentication required. */
export const publicProcedure = t.procedure;

/** Requires a valid session — throws UNAUTHORIZED otherwise. */
export const protectedProcedure = t.procedure.use(({ctx, next}) => {
    if (!ctx.session) {
        throw new TRPCError({code: 'UNAUTHORIZED'});
    }
    return next({ctx: {...ctx, session: ctx.session}});
}).use(errorHandlingMiddleware);

/** Requires a valid session AND role: tenant. */
export const tenantProcedure = protectedProcedure.use(({ctx, next}) => {
    if ((ctx.session.user as any).role !== 'tenant') {
        throw new TRPCError({code: 'FORBIDDEN'});
    }
    return next({ctx});
}).use(errorHandlingMiddleware);

export {TRPCError};
