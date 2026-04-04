import { inferAdditionalFields } from "better-auth/client/plugins";

/**
 * Shared auth configuration
 * Used by both React and vanilla clients to ensure consistency
 */
export const authConfig = {
	baseURL: process.env.NEXT_PUBLIC_API_WORKER_URL || 'http://localhost:8787',
	fetchOptions: {
		credentials: 'include' as const,
	},
	plugins: [
		inferAdditionalFields({
			user: {
				role: {
					type: "string" as const
				}
			}
		})
	],
};
