import {TRPCError} from "../trpc/init";
import {ZodError} from "zod";

export function errorHandler(err: unknown): never {
    if (err instanceof TRPCError) throw err; // Already a tRPC error
    if (err instanceof ZodError)
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid input',
            cause: err,            // attach ZodError
        });
    // Fallback for unexpected errors
    throw new TRPCError({code: 'INTERNAL_SERVER_ERROR', cause: err});
}