import { createAuthClient } from 'better-auth/react';
import { authConfig } from './auth-config';

/**
 * React auth client for components
 *
 * Uses better-auth/react for React hooks (useSession, useSignIn, etc.)
 * For middleware, import from './auth-client-vanilla' instead
 */
export const authClient = createAuthClient(authConfig);
