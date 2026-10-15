import { and, eq, isNull } from 'drizzle-orm'
import { transactionCategories } from '~~/server/db/schema'

export default defineTenantHandler('staff', async (event, { db }) => {
  const id = requireRouterId(event)
  const row = await db.query.transactionCategories.findFirst({
    where: and(eq(transactionCategories.id, id), isNull(transactionCategories.deletedAt)),
    with: {
      parent: { columns: { id: true, name: true } },
      children: { columns: { id: true, name: true, isActive: true } },
    },
  })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan' })
  return row
})
