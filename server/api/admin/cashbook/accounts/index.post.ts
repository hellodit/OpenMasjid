import { defineEventHandler } from 'h3'
import { z } from 'zod'
import { requireAdmin } from '~~/server/utils/auth'
import { readZodBody } from '~~/server/utils/validate'
import { db } from '~~/server/utils/db'
import { cashAccounts } from '~~/server/db/schema'

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(['cash', 'bank', 'ewallet']),
  accountNumber: z.string().trim().max(64).nullish(),
  holderName: z.string().trim().max(120).nullish(),
  openingBalance: z
    .union([z.string(), z.number()])
    .transform((v) => String(v))
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), 'Format saldo awal tidak valid')
    .default('0'),
  sortOrder: z.number().int().min(0).max(9999).default(0),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await readZodBody(event, bodySchema)
  const [row] = await db
    .insert(cashAccounts)
    .values({
      name: data.name,
      type: data.type,
      accountNumber: data.accountNumber ?? null,
      holderName: data.holderName ?? null,
      openingBalance: data.openingBalance,
      sortOrder: data.sortOrder,
    })
    .returning()
  return row
})
