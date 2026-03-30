/**
 * api-worker/src/trpc/context.ts
 *
 * tRPC context factory.
 *
 * The context is created once per request and passed to every procedure.
 * It carries the Cloudflare bindings (DB, DO namespace) so procedures
 * can access them without importing globals.
 *
 * Why use context instead of module-level globals?
 *  - Cloudflare Workers can run in multiple isolates simultaneously.
 *  - Bindings are request-scoped, not module-scoped.
 *  - Using context keeps procedures pure and testable.
 */

import type { Env } from '../index';

export interface Context {
  /** The raw incoming HTTP request. */
  req: Request;
  /** All Cloudflare Worker bindings (D1, DO, env vars). */
  env: Env;
  /** Worker execution context (waitUntil, passThroughOnException). */
  workerCtx: ExecutionContext;
}

export interface CreateContextOptions {
  req: Request;
  env: Env;
  ctx: ExecutionContext;
}

/**
 * Creates the tRPC context for each incoming request.
 * Called by fetchRequestHandler in src/index.ts.
 */
export function createContext({ req, env, ctx }: CreateContextOptions): Context {
  return { req, env, workerCtx: ctx };
}
