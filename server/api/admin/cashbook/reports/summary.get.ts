import { defineEventHandler } from 'h3'
import { and, eq, gte, isNull, lte, sql } from 'drizzle-orm'
import { requireAdmin } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { transactions } from '~~/server/db/schema'
import { listAccountsWithBalance } from '~~/server/utils/balance'
import { resolvePeriod } from '~~/server/utils/period'
import { readZodQuery } from '~~/server/utils/validate'
import { z } from 'zod'

const querySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const params = readZodQuery(event, querySchema)
  const range = resolvePeriod(params)

  const totalsByType = await db
    .select({
      type: transactions.type,
      total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)::text`,
      count: sql<number>`COUNT(*)::int`,
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

  const totals = {
    income: '0',
    expense: '0',
    transfer: '0',
    incomeCount: 0,
    expenseCount: 0,
    transferCount: 0,
  }
  for (const row of totalsByType) {
    if (row.type === 'income') {
      totals.income = row.total
      totals.incomeCount = row.count
    } else if (row.type === 'expense') {
      totals.expense = row.total
      totals.expenseCount = row.count
    } else {
      totals.transfer = row.total
      totals.transferCount = row.count
    }
  }

  const netCashFlow = (Number(totals.income) - Number(totals.expense)).toFixed(2)
  const accounts = await listAccountsWithBalance({ includeArchived: false })
  const totalBalance = accounts
    .reduce((sum, a) => sum + Number(a.balance), 0)
    .toFixed(2)

  return {
    range,
    totals: {
      income: totals.income,
      expense: totals.expense,
      transfer: totals.transfer,
      netCashFlow,
      incomeCount: totals.incomeCount,
      expenseCount: totals.expenseCount,
      transferCount: totals.transferCount,
    },
    accounts,
    totalBalance,
  }
})
