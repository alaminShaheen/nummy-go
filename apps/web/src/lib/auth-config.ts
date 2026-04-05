import { inferAdditionalFields } from "better-auth/client/plugins";
import { env } from '@/env';

/**
 * Shared auth configuration
 * Used by both React and vanilla clients to ensure consistency
 */
export const authConfig = {
	baseURL: env.NEXT_PUBLIC_API_WORKER_URL,
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
