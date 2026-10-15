import { and, eq, isNull } from 'drizzle-orm'
import { transactionCategories } from '~~/server/db/schema'
import { categoryReorderSchema } from '#shared/schemas/cashbook'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const { items } = await readZodBody(event, categoryReorderSchema)

  let updated = 0
  await db.transaction(async (tx) => {
    for (const item of items) {
      const rows = await tx
        .update(transactionCategories)
        .set({ sortOrder: item.sortOrder, updatedBy: user.id })
        .where(and(eq(transactionCategories.id, item.id), isNull(transactionCategories.deletedAt)))
        .returning({ id: transactionCategories.id })
      updated += rows.length
    }
  })

  return { updated }
})
