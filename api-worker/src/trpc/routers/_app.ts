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

import { router, publicProcedure } from '../init';
import { tenantRouter }   from './tenantRouter';
import { menuRouter } from './menuRouter';
import { categoryRouter } from './categoryRouter';
import { orderRouter } from './orderRouter';

export const appRouter = router({
  health:   publicProcedure.query(() => ({ status: 'ok' })),
  tenant:   tenantRouter,
  menu:     menuRouter,
  category: categoryRouter,
  order:    orderRouter,
});

/** The inferred type of the full router – used by frontend tRPC clients. */
export type AppRouter = typeof appRouter;
