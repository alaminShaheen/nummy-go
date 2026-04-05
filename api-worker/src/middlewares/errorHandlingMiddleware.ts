import {errorHandler} from "../utils/errorHandler";
import type {initTRPC} from '@trpc/server';
import type {Context} from '../trpc/context';

type TRPCInstance = ReturnType<ReturnType<typeof initTRPC.context<Context>>['create']>;

export function createErrorHandlingMiddleware(t: TRPCInstance) {
    return t.middleware(async ({next}) => {
        try {
            return await next();
        } catch (err) {
            errorHandler(err);
        }
    });
}