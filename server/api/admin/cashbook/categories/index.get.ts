import { and, asc, eq, isNull } from 'drizzle-orm'
import { transactionCategories } from '~~/server/db/schema'
import { categoryListQuery } from '#shared/schemas/cashbook'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const { includeArchived, type } = readZodQuery(event, categoryListQuery)

  return db.query.transactionCategories.findMany({
    where: and(
      isNull(transactionCategories.deletedAt),
      includeArchived ? undefined : eq(transactionCategories.isActive, true),
      type ? eq(transactionCategories.type, type) : undefined,
    ),
    orderBy: [
      asc(transactionCategories.type),
      asc(transactionCategories.sortOrder),
      asc(transactionCategories.name),
    ],
  })
})
