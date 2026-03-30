import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { initDatabase, getDb } from '@nummygo/shared/db';
import * as schema from '@nummygo/shared/db/schema';
import type { Env } from './index';

// Auth is created per-request after the DB is initialised with env.DB.
// Cloudflare Workers don't support module-level D1 bindings — bindings
// are only available inside the fetch() handler via the `env` argument.
export function createAuth(env: Env) {
  initDatabase(env.DB);

  return betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: 'sqlite',
      // Map BetterAuth's model names to your Drizzle tables.
      // BetterAuth will read/write through your schema instead of its own.
      schema: {
        user: schema.users,
      },
    }),
    user: {
      additionalFields: {
        phoneNumber: {
          type: 'string',
          unique: true,
        },
      },
    },
  });
}
