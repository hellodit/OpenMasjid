import { createError, defineEventHandler, getRouterParam } from 'h3'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { requireAdmin } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { transactionCategories, transactions } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const hasChildren = await db.query.transactionCategories.findFirst({
    where: and(eq(transactionCategories.parentId, id), isNull(transactionCategories.deletedAt)),
    columns: { id: true },
  })

  const usage = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(transactions)
    .where(sql`${transactions.categoryId} = ${id} AND ${transactions.deletedAt} IS NULL`)
  const hasTransactions = (usage[0]?.count ?? 0) > 0

  if (hasChildren || hasTransactions) {
    const [row] = await db
      .update(transactionCategories)
      .set({ isActive: false, updatedAt: sql`now()` })
      .where(and(eq(transactionCategories.id, id), isNull(transactionCategories.deletedAt)))
      .returning()
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan' })
    return { archived: true, category: row }
  }

  const [row] = await db
    .update(transactionCategories)
    .set({ deletedAt: sql`now()`, isActive: false })
    .where(and(eq(transactionCategories.id, id), isNull(transactionCategories.deletedAt)))
    .returning()
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan' })
  return { deleted: true, category: row }
})
