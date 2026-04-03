// This file is used ONLY by the BetterAuth CLI (pnpm betterauth generate).
// It is never imported by the worker runtime.
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { phoneNumber } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '@nummygo/shared/db/schema';

export const auth = betterAuth({
	appName: 'nummy-go',
	database: drizzleAdapter(drizzle(createClient({ url: ':memory:' })), {
		provider: 'sqlite',
		schema: { user: schema.users },
	}),
	socialProviders: {
		google: { clientId: '', clientSecret: '' },
	},
	plugins: [
		phoneNumber({
			sendOTP: async ({ phoneNumber, code }) => {
				console.log(`OTP for ${phoneNumber}: ${code}`);
			},
		}),
	],
});
