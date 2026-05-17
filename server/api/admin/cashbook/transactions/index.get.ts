import { defineEventHandler } from 'h3'
import { and, desc, eq, gte, ilike, isNull, lte, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { requireAdmin } from '~~/server/utils/auth'
import { readZodQuery } from '~~/server/utils/validate'
import { db } from '~~/server/utils/db'
import {
  cashAccounts,
  transactionCategories,
  transactions,
  users,
} from '~~/server/db/schema'
import { alias } from 'drizzle-orm/pg-core'

const querySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal: YYYY-MM-DD')
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal: YYYY-MM-DD')
    .optional(),
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const params = readZodQuery(event, querySchema)

  const destAccount = alias(cashAccounts, 'dest_account')

  const where = [isNull(transactions.deletedAt)]
  if (params.from) where.push(gte(transactions.transactionDate, params.from))
  if (params.to) where.push(lte(transactions.transactionDate, params.to))
  if (params.type) where.push(eq(transactions.type, params.type))
  if (params.accountId)
    where.push(
      or(
        eq(transactions.accountId, params.accountId),
        eq(transactions.destinationAccountId, params.accountId),
      )!,
    )
  if (params.categoryId) where.push(eq(transactions.categoryId, params.categoryId))
  if (params.q) where.push(ilike(transactions.description, `%${params.q}%`))

  const offset = (params.page - 1) * params.pageSize

  const rowsPromise = db
    .select({
      id: transactions.id,
      type: transactions.type,
      transactionDate: transactions.transactionDate,
      amount: transactions.amount,
      description: transactions.description,
      referenceNumber: transactions.referenceNumber,
      attachmentUrl: transactions.attachmentUrl,
      createdAt: transactions.createdAt,
      account: { id: cashAccounts.id, name: cashAccounts.name, type: cashAccounts.type },
      destinationAccount: {
        id: destAccount.id,
        name: destAccount.name,
        type: destAccount.type,
      },
      category: {
        id: transactionCategories.id,
        name: transactionCategories.name,
        colorToken: transactionCategories.colorToken,
        icon: transactionCategories.icon,
      },
      createdBy: { id: users.id, fullName: users.fullName },
    })
    .from(transactions)
    .leftJoin(cashAccounts, eq(transactions.accountId, cashAccounts.id))
    .leftJoin(destAccount, eq(transactions.destinationAccountId, destAccount.id))
    .leftJoin(
      transactionCategories,
      eq(transactions.categoryId, transactionCategories.id),
    )
    .leftJoin(users, eq(transactions.createdBy, users.id))
    .where(and(...where))
    .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
    .limit(params.pageSize)
    .offset(offset)

  const countPromise = db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(transactions)
    .where(and(...where))

  const [rows, countRow] = await Promise.all([rowsPromise, countPromise])
  const total = countRow[0]?.count ?? 0

  return {
    data: rows,
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
    },
  }
})
