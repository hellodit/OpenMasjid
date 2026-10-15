import { and, desc, eq, gte, isNull, lte, sql } from 'drizzle-orm'
import { z } from 'zod'
import { transactionCategories, transactions } from '~~/server/db/schema'
import { periodQuery } from '#shared/schemas/common'

const querySchema = periodQuery.extend({
  type: z.enum(['income', 'expense']).default('expense'),
})

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const params = readZodQuery(event, querySchema)
  const range = resolvePeriod(params, await getMosqueTimezone())

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
    .leftJoin(transactionCategories, eq(transactions.categoryId, transactionCategories.id))
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

  const grandTotal = sumMoney(rows.map((r) => r.total))
  const breakdown = rows.map((r) => ({
    ...r,
    percentage: Number(grandTotal) > 0 ? ((Number(r.total) / Number(grandTotal)) * 100).toFixed(2) : '0.00',
  }))

  return { range, type: params.type, grandTotal, breakdown }
})
