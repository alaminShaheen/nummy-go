import { z } from 'zod';
import { isValid } from 'ulidx';

/**
 * Reusable Zod schemas for common data types
 */

export const ulidSchema = z.string().refine(isValid, { message: 'Invalid ULID' });

export const timestampSchema = z
  .number()
  .int()
  .nonnegative()
  .refine((val) => !isNaN(new Date(val).getTime()), {
    message: "Invalid timestamp",
  });

export const priceSchema = z
    .number()
    .nonnegative()
    .refine((val) => Number.isInteger(val * 100), {
        message: "Price can have at most 2 decimal places",
    })
    .transform((val) => Math.round(val * 100));

export const outputPriceSchema = z.number().transform((val) => parseFloat((val / 100).toFixed(2)));