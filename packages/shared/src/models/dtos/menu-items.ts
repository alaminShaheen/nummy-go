import { z } from 'zod';

export const createMenuItemSchema = z.object({
  tenantId: z.uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().positive(),
  category: z.string().min(1),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
  price: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export type CreateMenuItemDto = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemDto = z.infer<typeof updateMenuItemSchema>;
