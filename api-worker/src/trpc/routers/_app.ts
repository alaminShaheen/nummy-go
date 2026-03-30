/**
 * api-worker/src/trpc/routers/_app.ts
 *
 * Root application router.
 * Merges all sub-routers into a single AppRouter.
 *
 * The `AppRouter` type is exported and imported by the frontend apps
 * (customer-web, tenant-web) as a type-only import to power the tRPC client.
 * This gives end-to-end type safety without shipping server code to the browser.
 *
 * Usage in frontend:
 *   import type { AppRouter } from 'api-worker/types';
 *   const trpc = createTRPCReact<AppRouter>();
 */

import { router } from '../init';
import { customerRouter } from './customerRouter';
import { tenantRouter }   from './tenantRouter';

export const appRouter = router({
  customer: customerRouter,
  tenant:   tenantRouter,
});

/** The inferred type of the full router – used by frontend tRPC clients. */
export type AppRouter = typeof appRouter;
