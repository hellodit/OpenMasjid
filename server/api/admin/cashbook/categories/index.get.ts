import { defineEventHandler, getQuery } from 'h3'
import { and, asc, eq, isNull, sql } from 'drizzle-orm'
import { requireAdmin } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { transactionCategories } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const includeArchived = query.includeArchived === 'true' || query.includeArchived === '1'
  const type = query.type === 'income' || query.type === 'expense' ? query.type : null

  const where = [isNull(transactionCategories.deletedAt)]
  if (!includeArchived) where.push(eq(transactionCategories.isActive, true))
  if (type) where.push(eq(transactionCategories.type, type))

  const rows = await db
    .select()
    .from(transactionCategories)
    .where(and(...where))
    .orderBy(
      asc(transactionCategories.type),
      asc(transactionCategories.sortOrder),
      asc(transactionCategories.name),
    )

  return rows
})
