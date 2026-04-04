import { createAuthClient } from 'better-auth/client';
import { authConfig } from './auth-config';

/**
 * Vanilla auth client for non-React contexts
 *
 * Use this in:
 * - Middleware (edge runtime)
 * - Server components
 * - API routes
 *
 * For React components with hooks, use './auth-client' instead
 */
export const authClientVanilla = createAuthClient(authConfig);
