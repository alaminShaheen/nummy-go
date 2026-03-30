import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

// Example router demonstrating Cloudflare service usage
// Uncomment the sections you need and configure the bindings in wrangler.toml

export const cloudflareRouter = router({
  // Get Cloudflare request info
  getRequestInfo: publicProcedure.query(({ ctx }) => {
    return {
      hasCloudflareContext: !!ctx.env,
      // Cloudflare request properties (available when deployed)
      cf: ctx.cf ? {
        colo: ctx.cf.colo, // Data center location
        country: ctx.cf.country,
        city: ctx.cf.city,
        timezone: ctx.cf.timezone,
      } : null,
    };
  }),

  // Example: KV Storage
  // Uncomment when you have MY_KV configured in wrangler.toml
  // kvGet: publicProcedure
  //   .input(z.object({ key: z.string() }))
  //   .query(async ({ ctx, input }) => {
  //     if (!ctx.env?.MY_KV) {
  //       throw new Error('KV namespace not configured');
  //     }
  //     const value = await ctx.env.MY_KV.get(input.key);
  //     return { key: input.key, value };
  //   }),

  // kvSet: publicProcedure
  //   .input(z.object({ key: z.string(), value: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     if (!ctx.env?.MY_KV) {
  //       throw new Error('KV namespace not configured');
  //     }
  //     await ctx.env.MY_KV.put(input.key, input.value);
  //     return { success: true, key: input.key };
  //   }),

  // Example: D1 Database
  // Uncomment when you have DB configured in wrangler.toml
  // dbQuery: publicProcedure
  //   .input(z.object({ query: z.string() }))
  //   .query(async ({ ctx, input }) => {
  //     if (!ctx.env?.DB) {
  //       throw new Error('D1 database not configured');
  //     }
  //     const result = await ctx.env.DB.prepare(input.query).all();
  //     return result;
  //   }),

  // Example: R2 Storage
  // Uncomment when you have MY_BUCKET configured in wrangler.toml
  // r2Upload: publicProcedure
  //   .input(z.object({ key: z.string(), content: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     if (!ctx.env?.MY_BUCKET) {
  //       throw new Error('R2 bucket not configured');
  //     }
  //     await ctx.env.MY_BUCKET.put(input.key, input.content);
  //     return { success: true, key: input.key };
  //   }),

  // r2Get: publicProcedure
  //   .input(z.object({ key: z.string() }))
  //   .query(async ({ ctx, input }) => {
  //     if (!ctx.env?.MY_BUCKET) {
  //       throw new Error('R2 bucket not configured');
  //     }
  //     const object = await ctx.env.MY_BUCKET.get(input.key);
  //     if (!object) return null;
  //     const content = await object.text();
  //     return { key: input.key, content };
  //   }),

  // Example: Workers AI
  // Uncomment when you have AI binding configured in wrangler.toml
  // aiInference: publicProcedure
  //   .input(z.object({ prompt: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     if (!ctx.env?.AI) {
  //       throw new Error('AI binding not configured');
  //     }
  //     const response = await ctx.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
  //       prompt: input.prompt,
  //     });
  //     return response;
  //   }),

  // Example: Analytics Engine
  // Uncomment when you have ANALYTICS configured in wrangler.toml
  // logAnalytics: publicProcedure
  //   .input(z.object({
  //     event: z.string(),
  //     data: z.record(z.unknown()),
  //   }))
  //   .mutation(async ({ ctx, input }) => {
  //     if (!ctx.env?.ANALYTICS) {
  //       throw new Error('Analytics Engine not configured');
  //     }
  //     ctx.env.ANALYTICS.writeDataPoint({
  //       blobs: [input.event],
  //       doubles: [],
  //       indexes: [input.event],
  //     });
  //     return { success: true };
  //   }),
});
