import { createError, defineEventHandler, getRouterParam } from 'h3'
import { and, eq, isNull, sql } from 'drizzle-orm'
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

const bodySchema = z.object({
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  accountId: z.string().uuid().optional(),
  destinationAccountId: z.string().uuid().nullish(),
  categoryId: z.string().uuid().nullish(),
  amount: amountSchema.optional(),
  description: z.string().trim().min(1).max(500).optional(),
  referenceNumber: z.string().trim().max(80).nullish(),
  attachmentUrl: z.string().trim().url().nullish(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  const data = await readZodBody(event, bodySchema)

  const current = await db.query.transactions.findFirst({
    where: and(eq(transactions.id, id), isNull(transactions.deletedAt)),
  })
  if (!current)
    throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })

  const merged = {
    type: current.type,
    accountId: data.accountId ?? current.accountId,
    destinationAccountId:
      data.destinationAccountId !== undefined
        ? data.destinationAccountId
        : current.destinationAccountId,
    categoryId:
      data.categoryId !== undefined ? data.categoryId : current.categoryId,
  }

  if (merged.type === 'transfer') {
    if (!merged.destinationAccountId)
      throw createError({ statusCode: 400, statusMessage: 'Akun tujuan wajib diisi untuk transfer' })
    if (merged.destinationAccountId === merged.accountId)
      throw createError({ statusCode: 400, statusMessage: 'Akun tujuan harus berbeda' })
    if (merged.categoryId)
      throw createError({ statusCode: 400, statusMessage: 'Transfer tidak boleh punya kategori' })

    const dest = await db.query.cashAccounts.findFirst({
      where: and(
        eq(cashAccounts.id, merged.destinationAccountId),
        isNull(cashAccounts.deletedAt),
      ),
      columns: { id: true, isActive: true },
    })
    if (!dest?.isActive)
      throw createError({ statusCode: 400, statusMessage: 'Akun tujuan tidak aktif' })
  } else {
    if (!merged.categoryId)
      throw createError({ statusCode: 400, statusMessage: 'Kategori wajib diisi' })
    if (merged.destinationAccountId)
      throw createError({ statusCode: 400, statusMessage: 'Hanya transfer yang punya akun tujuan' })

    const category = await db.query.transactionCategories.findFirst({
      where: and(
        eq(transactionCategories.id, merged.categoryId),
        isNull(transactionCategories.deletedAt),
      ),
      columns: { id: true, type: true, isActive: true },
    })
    if (!category?.isActive)
      throw createError({ statusCode: 400, statusMessage: 'Kategori tidak valid' })
    if (category.type !== current.type)
      throw createError({ statusCode: 400, statusMessage: 'Kategori tidak cocok dengan tipe transaksi' })
  }

  const sourceAccount = await db.query.cashAccounts.findFirst({
    where: and(eq(cashAccounts.id, merged.accountId), isNull(cashAccounts.deletedAt)),
    columns: { id: true, isActive: true },
  })
  if (!sourceAccount?.isActive)
    throw createError({ statusCode: 400, statusMessage: 'Akun sumber tidak aktif' })

  const updateValues = {
    transactionDate: data.transactionDate ?? current.transactionDate,
    accountId: merged.accountId,
    destinationAccountId: merged.destinationAccountId,
    categoryId: merged.categoryId,
    amount: data.amount ?? current.amount,
    description: data.description ?? current.description,
    referenceNumber:
      data.referenceNumber !== undefined ? data.referenceNumber : current.referenceNumber,
    attachmentUrl:
      data.attachmentUrl !== undefined ? data.attachmentUrl : current.attachmentUrl,
    updatedBy: user.id,
    updatedAt: sql`now()`,
  }

  const [row] = await db
    .update(transactions)
    .set(updateValues)
    .where(eq(transactions.id, id))
    .returning()
  return row
})
