import { defineEventHandler } from 'h3'
import { and, desc, eq, gte, isNull, lte, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { listAccountsWithBalance } from '~~/server/utils/balance'
import { resolvePeriod } from '~~/server/utils/period'
import { readZodQuery } from '~~/server/utils/validate'
import { transactionCategories, transactions } from '~~/server/db/schema'
import { z } from 'zod'

const querySchema = z.object({
  period: z.enum(['month', 'year']).default('month'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export default defineEventHandler(async (event) => {
  const params = readZodQuery(event, querySchema)
  const range = resolvePeriod(params)

  const totalsByType = await db
    .select({
      type: transactions.type,
      total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)::text`,
    })
    .from(transactions)
    .where(
      and(
        isNull(transactions.deletedAt),
        gte(transactions.transactionDate, range.from),
        lte(transactions.transactionDate, range.to),
      ),
    )
    .groupBy(transactions.type)

  let totalIncome = '0'
  let totalExpense = '0'
  for (const row of totalsByType) {
    if (row.type === 'income') totalIncome = row.total
    else if (row.type === 'expense') totalExpense = row.total
  }

  const accounts = await listAccountsWithBalance({ includeArchived: false })
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0).toFixed(2)

  const breakdownRows = await db
    .select({
      categoryName: transactionCategories.name,
      colorToken: transactionCategories.colorToken,
      type: transactions.type,
      total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)::text`,
    })
    .from(transactions)
    .leftJoin(
      transactionCategories,
      eq(transactions.categoryId, transactionCategories.id),
    )
    .where(
      and(
        isNull(transactions.deletedAt),
        gte(transactions.transactionDate, range.from),
        lte(transactions.transactionDate, range.to),
        sql`${transactions.type} IN ('income', 'expense')`,
      ),
    )
    .groupBy(
      transactionCategories.name,
      transactionCategories.colorToken,
      transactions.type,
    )
    .orderBy(desc(sql`SUM(${transactions.amount})`))
    .limit(10)

  return {
    range,
    totalBalance,
    totalIncome,
    totalExpense,
    netCashFlow: (Number(totalIncome) - Number(totalExpense)).toFixed(2),
    topCategories: breakdownRows,
    accountCount: accounts.length,
  }
})
