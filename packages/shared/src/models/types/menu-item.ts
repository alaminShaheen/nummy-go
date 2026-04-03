import { z } from 'zod';
import {priceSchema, timestampSchema} from '../schemas';

export const menuItemSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  price: priceSchema,
  category: z.string(),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  createdAt: timestampSchema,
});

export type MenuItem = z.infer<typeof menuItemSchema>;
