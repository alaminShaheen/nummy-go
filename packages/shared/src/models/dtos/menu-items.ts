import { z } from 'zod';
import {ulidSchema, timestampSchema, priceSchema, outputPriceSchema} from '../schemas';

// ── API-facing ─────────────────────────────────────────────────────────────

export const createMenuItemSchema = z.object({
  tenantId:    ulidSchema,
  categoryId:  ulidSchema.optional(),
  name:        z.string().min(1),
  description: z.string().optional(),
  imageUrl:    z.string().optional(),
  price:       priceSchema,
  isAvailable: z.boolean().default(true),
  isFeatured:  z.boolean().default(false),
  badge:       z.string().nullable().optional(),
  calories:    z.number().int().positive().optional().nullable(),
});

export const updateMenuItemSchema = z.object({
  name:        z.string().min(1).optional(),
  description: z.string().optional(),
  imageUrl:    z.string().nullable().optional(),
  price:       priceSchema.optional(),
  categoryId:  ulidSchema.optional(),
  isAvailable: z.boolean().optional(),
  isFeatured:  z.boolean().optional(),
  badge:       z.string().nullable().optional(),
  calories:    z.number().int().positive().optional().nullable(),
});

export const updateMenuItemRequestSchema = updateMenuItemSchema.extend({
  id: ulidSchema,
});

export const deleteMenuItemSchema = z.object({
  id: ulidSchema,
});

export const createMenuItemCategorySchema = z.object({
  tenantId:  ulidSchema,
  name:      z.string().min(1),
  sortOrder: z.number().int().min(0).default(0),
});

// ── Internal (query-facing) ────────────────────────────────────────────────

export const createMenuItemRecordSchema = createMenuItemSchema.extend({
  id:        ulidSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const createMenuItemCategoryRecordSchema = createMenuItemCategorySchema.extend({
  id:        ulidSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const menuItemResponseSchema = z.object({
  id:          ulidSchema,
  tenantId:    ulidSchema,
  categoryId:  ulidSchema.nullable(),
  name:        z.string(),
  description: z.string().nullable(),
  imageUrl:    z.string().nullable(),
  price:       outputPriceSchema,
  isAvailable: z.boolean(),
  isFeatured:  z.boolean(),
  badge:       z.string().nullable(),
  calories:    z.number().int().positive().nullable().optional(),
  createdAt:   timestampSchema,
  updatedAt:   timestampSchema.nullable(),
});

export type CreateMenuItemDto               = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemDto               = z.infer<typeof updateMenuItemSchema>;
export type UpdateMenuItemRequestDto        = z.infer<typeof updateMenuItemRequestSchema>;
export type CreateMenuItemCategoryDto       = z.infer<typeof createMenuItemCategorySchema>;
export type CreateMenuItemRecordDto         = z.infer<typeof createMenuItemRecordSchema>;
export type CreateMenuItemCategoryRecordDto = z.infer<typeof createMenuItemCategoryRecordSchema>;
export type MenuItemResponseDto             = z.infer<typeof menuItemResponseSchema>;
