import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_WORKER_URL: z.url(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_WORKER_URL: process.env.NEXT_PUBLIC_API_WORKER_URL,
});
