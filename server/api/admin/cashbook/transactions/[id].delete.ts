import { createError, defineEventHandler, getRouterParam } from 'h3'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { requireAdmin } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { transactions } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const [row] = await db
    .update(transactions)
    .set({ deletedAt: sql`now()`, updatedBy: user.id, updatedAt: sql`now()` })
    .where(and(eq(transactions.id, id), isNull(transactions.deletedAt)))
    .returning()

  if (!row)
    throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })
  return { deleted: true, transaction: row }
})
