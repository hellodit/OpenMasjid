import { createError, defineEventHandler } from 'h3'
import { and, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { requireAdmin } from '~~/server/utils/auth'
import { readZodBody } from '~~/server/utils/validate'
import { db } from '~~/server/utils/db'
import {
  cashAccounts,
  transactionCategories,
  transactions,
} from '~~/server/db/schema'

const amountSchema = z
  .union([z.string(), z.number()])
  .transform((v) => String(v))
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), 'Format nominal tidak valid')
  .refine((v) => Number(v) > 0, 'Nominal harus lebih dari 0')

const bodySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('income'),
    transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    accountId: z.string().uuid(),
    categoryId: z.string().uuid(),
    amount: amountSchema,
    description: z.string().trim().min(1).max(500),
    referenceNumber: z.string().trim().max(80).nullish(),
    attachmentUrl: z.string().trim().url().nullish(),
  }),
  z.object({
    type: z.literal('expense'),
    transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    accountId: z.string().uuid(),
    categoryId: z.string().uuid(),
    amount: amountSchema,
    description: z.string().trim().min(1).max(500),
    referenceNumber: z.string().trim().max(80).nullish(),
    attachmentUrl: z.string().trim().url().nullish(),
  }),
  z.object({
    type: z.literal('transfer'),
    transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    accountId: z.string().uuid(),
    destinationAccountId: z.string().uuid(),
    amount: amountSchema,
    description: z.string().trim().min(1).max(500),
    referenceNumber: z.string().trim().max(80).nullish(),
    attachmentUrl: z.string().trim().url().nullish(),
  }),
])

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const data = await readZodBody(event, bodySchema)

  const sourceAccount = await db.query.cashAccounts.findFirst({
    where: and(eq(cashAccounts.id, data.accountId), isNull(cashAccounts.deletedAt)),
    columns: { id: true, isActive: true },
  })
  if (!sourceAccount?.isActive)
    throw createError({ statusCode: 400, statusMessage: 'Akun sumber tidak aktif' })

  if (data.type === 'transfer') {
    if (data.destinationAccountId === data.accountId)
      throw createError({ statusCode: 400, statusMessage: 'Akun tujuan harus berbeda' })
    const dest = await db.query.cashAccounts.findFirst({
      where: and(
        eq(cashAccounts.id, data.destinationAccountId),
        isNull(cashAccounts.deletedAt),
      ),
      columns: { id: true, isActive: true },
    })
    if (!dest?.isActive)
      throw createError({ statusCode: 400, statusMessage: 'Akun tujuan tidak aktif' })
  } else {
    const category = await db.query.transactionCategories.findFirst({
      where: and(
        eq(transactionCategories.id, data.categoryId),
        isNull(transactionCategories.deletedAt),
      ),
      columns: { id: true, type: true, isActive: true },
    })
    if (!category)
      throw createError({ statusCode: 400, statusMessage: 'Kategori tidak ditemukan' })
    if (!category.isActive)
      throw createError({ statusCode: 400, statusMessage: 'Kategori sudah diarsipkan' })
    if (category.type !== data.type)
      throw createError({
        statusCode: 400,
        statusMessage: `Kategori untuk ${data.type === 'income' ? 'pemasukan' : 'pengeluaran'} tidak cocok`,
      })
  }

  const [row] = await db
    .insert(transactions)
    .values({
      type: data.type,
      transactionDate: data.transactionDate,
      accountId: data.accountId,
      destinationAccountId:
        data.type === 'transfer' ? data.destinationAccountId : null,
      categoryId: data.type === 'transfer' ? null : data.categoryId,
      amount: data.amount,
      description: data.description,
      referenceNumber: data.referenceNumber ?? null,
      attachmentUrl: data.attachmentUrl ?? null,
      createdBy: user.id,
    })
    .returning()

  return row
})
