import { and, eq, isNull } from 'drizzle-orm'
import { transactions } from '~~/server/db/schema'

export default defineTenantHandler('admin', async (event, { db, user }) => {
  const id = requireRouterId(event)

  const [row] = await db
    .update(transactions)
    .set({ deletedAt: new Date(), updatedBy: user.id })
    .where(and(eq(transactions.id, id), isNull(transactions.deletedAt)))
    .returning()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })
  return { deleted: true, transaction: row }
})
