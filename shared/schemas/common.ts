import { z } from 'zod'

/** `YYYY-MM-DD` calendar date. */
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal: YYYY-MM-DD')

/** `HH:MM` or `HH:MM:SS`. */
export const timeOfDay = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Format jam: HH:MM')

/** Money as string (numeric(14,2)); accepts numbers from forms. */
export const money = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim())
  .refine((v) => /^\d{1,12}(\.\d{1,2})?$/.test(v), 'Format nominal tidak valid')

export const positiveMoney = money.refine((v) => Number(v) > 0, 'Nominal harus lebih dari 0')

export const uuid = z.uuid('ID tidak valid')

/** Empty string from inputs → null. */
export const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null))

export const queryBool = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform((v) => v === true || v === 'true' || v === '1')

export const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
}

export const periodQuery = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).optional(),
  date: isoDate.optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
})
