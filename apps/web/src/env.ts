import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_WORKER_URL: z.string().url(),
});

/**
 * Lazily validated env — avoids crashing during Next.js static generation
 * (e.g. `/_not-found`) when the env var isn't available at build time.
 */
function getEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_WORKER_URL: process.env.NEXT_PUBLIC_API_WORKER_URL,
  });

  if (!parsed.success) {
    // During build-time static generation, env vars may be missing — that's OK.
    // The pages that actually need the API URL are all client-rendered.
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      return { NEXT_PUBLIC_API_WORKER_URL: '' } as z.infer<typeof envSchema>;
    }
    throw new Error(
      `❌ Invalid environment variables:\n${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}`
    );
  }

  return parsed.data;
}

export const env = getEnv();
