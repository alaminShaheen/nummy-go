import {betterAuth} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import {phoneNumber} from 'better-auth/plugins';
import {drizzle} from 'drizzle-orm/d1';
import {createTenantForUser} from './services/tenantService';
import * as schema from '@nummygo/shared/db/schema';
import type {Env} from './index';

export function createAuth(env: Env) {
	return betterAuth({
		appName: 'nummy-go',
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
		database: drizzleAdapter(drizzle(env.DB, {schema}), {
			provider: 'sqlite',
			schema: {
				user: schema.users,
				session: schema.sessions,
				account: schema.accounts,
				verification: schema.verifications,
			},
		}),
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},
		user: {
			additionalFields: {
				role: {
					type: 'string',
					defaultValue: 'customer',
					input: true,
				},
				phoneNumber: {
					type: 'string',
					unique: true,
				},
			},
		},
		databaseHooks: {
			user: {
				create: {
					after: async (user, ctx) => {
						const origin = ctx?.request?.headers.get('origin') ?? '';
						if (origin === env.TENANT_WEB_URL) {
							await createTenantForUser(user.id);
						}
					},
				},
			},
		},
		plugins: [
			phoneNumber({
				sendOTP: async ({phoneNumber, code}) => {
					console.log(`OTP for ${phoneNumber}: ${code}`);
				},
			}),
		],
	});
}
