import { and, desc, eq, gte, inArray, isNull, lte, sql } from 'drizzle-orm'
import { z } from 'zod'
import { transactionCategories, transactions } from '~~/server/db/schema'
import { isoDate } from '#shared/schemas/common'

const querySchema = z.object({
  period: z.enum(['month', 'year']).default('month'),
  date: isoDate.optional(),
})

/** Public transparency summary — no per-transaction detail is exposed. */
export default defineEventHandler(async (event) => {
  const params = readZodQuery(event, querySchema)
  const range = resolvePeriod(params, await getMosqueTimezone())
  const inRange = and(
    isNull(transactions.deletedAt),
    gte(transactions.transactionDate, range.from),
    lte(transactions.transactionDate, range.to),
  )

  const [totalsByType, accounts, topCategories] = await Promise.all([
    db
      .select({
        type: transactions.type,
        total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)::text`,
      })
      .from(transactions)
      .where(inRange)
      .groupBy(transactions.type),
    listAccountsWithBalance({ includeArchived: true }),
    db
      .select({
        categoryName: transactionCategories.name,
        colorToken: transactionCategories.colorToken,
        type: transactions.type,
        total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)::text`,
      })
      .from(transactions)
      .leftJoin(transactionCategories, eq(transactions.categoryId, transactionCategories.id))
      .where(and(inRange, inArray(transactions.type, ['income', 'expense'])))
      .groupBy(transactionCategories.name, transactionCategories.colorToken, transactions.type)
      .orderBy(desc(sql`SUM(${transactions.amount})`))
      .limit(10),
  ])

  const totalIncome = totalsByType.find((r) => r.type === 'income')?.total ?? '0'
  const totalExpense = totalsByType.find((r) => r.type === 'expense')?.total ?? '0'

  return {
    range,
    totalBalance: sumMoney(accounts.map((a) => a.balance)),
    totalIncome,
    totalExpense,
    netCashFlow: subMoney(totalIncome, totalExpense),
    topCategories,
    accountCount: accounts.filter((a) => a.isActive).length,
  }
})
