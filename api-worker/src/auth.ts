import {betterAuth} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import {phoneNumber} from 'better-auth/plugins';
import {drizzle} from 'drizzle-orm/libsql';
import {createClient} from '@libsql/client';
import {getDb} from '@nummygo/shared/db';
import {createTenantForUser} from './services/tenantService';
import * as schema from '@nummygo/shared/db/schema';
import type {Env} from './index';

// ── Static export for BetterAuth CLI ──────────────────────────────────────
// Uses in-memory SQLite so `pnpm generate` works without D1.
export const auth = betterAuth({
	appName: 'nummy-go',
	database: drizzleAdapter(drizzle(createClient({url: ':memory:'})), {
		provider: 'sqlite',
		schema: {user: schema.users},
	}),
	socialProviders: {
		google: {clientId: '', clientSecret: ''},
	},
	plugins: [
		phoneNumber({
			sendOTP: async ({phoneNumber, code}) => {
				console.log(`OTP for ${phoneNumber}: ${code}`);
			},
		}),
	],
});

// ── Runtime factory ────────────────────────────────────────────────────────
export function createAuth(env: Env) {
	return betterAuth({
		appName: 'nummy-go',
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		database: drizzleAdapter(getDb(), {
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
						const isTenant = origin === env.TENANT_WEB_URL;
						if (!isTenant) return;
						await createTenantForUser(user.id);
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
