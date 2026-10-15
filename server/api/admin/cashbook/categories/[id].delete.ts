import { and, eq, isNull, sql } from 'drizzle-orm'
import { transactionCategories, transactions } from '~~/server/db/schema'

/** Categories still referenced (children or transactions) are archived instead of deleted. */
export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = requireRouterId(event)

  const hasChildren = await db.query.transactionCategories.findFirst({
    where: and(eq(transactionCategories.parentId, id), isNull(transactionCategories.deletedAt)),
    columns: { id: true },
  })
  const [usage] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(transactions)
    .where(and(eq(transactions.categoryId, id), isNull(transactions.deletedAt)))

  const where = and(eq(transactionCategories.id, id), isNull(transactionCategories.deletedAt))

  if (hasChildren || (usage?.count ?? 0) > 0) {
    const [row] = await db
      .update(transactionCategories)
      .set({ isActive: false, updatedBy: user.id })
      .where(where)
      .returning()
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan' })
    return { archived: true, category: row }
  }

  const [row] = await db
    .update(transactionCategories)
    .set({ deletedAt: new Date(), isActive: false, updatedBy: user.id })
    .where(where)
    .returning()
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan' })
  return { deleted: true, category: row }
})
