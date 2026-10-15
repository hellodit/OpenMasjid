import { and, gte, isNull, lte, sql } from 'drizzle-orm'
import { transactions } from '~~/server/db/schema'
import { periodQuery } from '#shared/schemas/common'

export default defineTenantHandler('staff', async (event, { db, tenant }) => {
  const range = resolvePeriod(readZodQuery(event, periodQuery), tenant.timezone)

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

  const pick = (type: string) => totalsByType.find((r) => r.type === type)
  const income = pick('income')?.total ?? '0'
  const expense = pick('expense')?.total ?? '0'

  const accounts = await listAccountsWithBalance(db, { includeArchived: true })

  return {
    range,
    totals: {
      income,
      expense,
      transfer: pick('transfer')?.total ?? '0',
      netCashFlow: subMoney(income, expense),
      incomeCount: pick('income')?.count ?? 0,
      expenseCount: pick('expense')?.count ?? 0,
      transferCount: pick('transfer')?.count ?? 0,
    },
    accounts: accounts.filter((a) => a.isActive),
    // Archived accounts are included so money never "disappears".
    totalBalance: sumMoney(accounts.map((a) => a.balance)),
  }
})
