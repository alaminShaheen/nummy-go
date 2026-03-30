/**
 * apps/customer-web/src/trpc/client.ts
 *
 * Creates the typed tRPC React client bound to the api-worker's AppRouter.
 *
 * Why import AppRouter from api-worker?
 *  - The tRPC client needs the router type to generate typed hooks.
 *  - We import it as a TYPE ONLY (no runtime code from the worker ships here).
 *  - This gives full end-to-end type safety: wrong inputs/outputs = TS error.
 */

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from 'api-worker/types';

/**
 * `trpc` is the typed React hook factory.
 * Use it anywhere in customer-web:
 *   const orders = trpc.customer.getOrders.useQuery({ customerId });
 *   const place  = trpc.customer.placeOrder.useMutation();
 */
export const trpc = createTRPCReact<AppRouter>();
