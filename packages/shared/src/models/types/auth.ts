import {betterAuth, BetterAuthOptions} from 'better-auth';


/**
 * Create a betterAuth instance with the shared configuration
 * This is used by the server and ensures type consistency with the client
 */
export function createBetterAuth(options: BetterAuthOptions) {
    return betterAuth(options);
}

// Export the Auth type for client-side usage
export type Auth = ReturnType<typeof createBetterAuth>;
