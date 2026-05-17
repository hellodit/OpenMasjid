import { defineEventHandler } from 'h3'
import { and, desc, eq, gte, isNull, lte, sql } from 'drizzle-orm'
import { requireAdmin } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { transactionCategories, transactions } from '~~/server/db/schema'
import { resolvePeriod } from '~~/server/utils/period'
import { readZodQuery } from '~~/server/utils/validate'
import { z } from 'zod'

const querySchema = z.object({
  type: z.enum(['income', 'expense']).default('expense'),
  period: z.enum(['day', 'week', 'month', 'year']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const params = readZodQuery(event, querySchema)
  const range = resolvePeriod(params)

  const rows = await db
    .select({
      categoryId: transactions.categoryId,
      categoryName: transactionCategories.name,
      colorToken: transactionCategories.colorToken,
      icon: transactionCategories.icon,
      total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)::text`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(transactions)
    .leftJoin(
      transactionCategories,
      eq(transactions.categoryId, transactionCategories.id),
    )
    .where(
      and(
        isNull(transactions.deletedAt),
        eq(transactions.type, params.type),
        gte(transactions.transactionDate, range.from),
        lte(transactions.transactionDate, range.to),
      ),
    )
    .groupBy(
      transactions.categoryId,
      transactionCategories.name,
      transactionCategories.colorToken,
      transactionCategories.icon,
    )
    .orderBy(desc(sql`SUM(${transactions.amount})`))

  const grandTotal = rows.reduce((sum, r) => sum + Number(r.total), 0)
  const breakdown = rows.map((r) => ({
    ...r,
    percentage: grandTotal > 0 ? ((Number(r.total) / grandTotal) * 100).toFixed(2) : '0.00',
  }))

  return { range, type: params.type, grandTotal: grandTotal.toFixed(2), breakdown }
})
