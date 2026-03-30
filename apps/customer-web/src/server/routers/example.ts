import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const exampleRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name}!`,
      };
    }),

  getAll: publicProcedure.query(() => {
    return {
      items: ['Item 1', 'Item 2', 'Item 3'],
    };
  }),

  create: publicProcedure
    .input(z.object({ title: z.string() }))
    .mutation(({ input }) => {
      return {
        id: Math.random().toString(36).substring(7),
        title: input.title,
        createdAt: new Date(),
      };
    }),
});
