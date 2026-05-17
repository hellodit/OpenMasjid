import { createError, defineEventHandler, getRouterParam } from 'h3'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { z } from 'zod'
import { requireAdmin } from '~~/server/utils/auth'
import { readZodBody } from '~~/server/utils/validate'
import { db } from '~~/server/utils/db'
import { cashAccounts } from '~~/server/db/schema'

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  type: z.enum(['cash', 'bank', 'ewallet']).optional(),
  accountNumber: z.string().trim().max(64).nullish(),
  holderName: z.string().trim().max(120).nullish(),
  openingBalance: z
    .union([z.string(), z.number()])
    .transform((v) => String(v))
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), 'Format saldo awal tidak valid')
    .optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  const data = await readZodBody(event, bodySchema)

  const [row] = await db
    .update(cashAccounts)
    .set({ ...data, updatedAt: sql`now()` })
    .where(and(eq(cashAccounts.id, id), isNull(cashAccounts.deletedAt)))
    .returning()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Akun tidak ditemukan' })
  return row
})
