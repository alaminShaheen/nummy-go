import { z } from 'zod';

export const menuItemSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  price: z.number(),
  category: z.string(),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  createdAt: z.string(),
});

export type MenuItem = z.infer<typeof menuItemSchema>;
