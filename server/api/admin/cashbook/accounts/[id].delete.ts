import { createError, defineEventHandler, getRouterParam } from 'h3'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { requireAdmin } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { cashAccounts, transactions } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const usage = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(transactions)
    .where(
      sql`(${transactions.accountId} = ${id} OR ${transactions.destinationAccountId} = ${id}) AND ${transactions.deletedAt} IS NULL`,
    )

  const hasTransactions = (usage[0]?.count ?? 0) > 0

  if (hasTransactions) {
    const [row] = await db
      .update(cashAccounts)
      .set({ isActive: false, updatedAt: sql`now()` })
      .where(and(eq(cashAccounts.id, id), isNull(cashAccounts.deletedAt)))
      .returning()
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Akun tidak ditemukan' })
    return { archived: true, account: row }
  }

  const [row] = await db
    .update(cashAccounts)
    .set({ deletedAt: sql`now()`, isActive: false })
    .where(and(eq(cashAccounts.id, id), isNull(cashAccounts.deletedAt)))
    .returning()
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Akun tidak ditemukan' })
  return { deleted: true, account: row }
})
