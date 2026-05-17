import { createError, defineEventHandler, getRouterParam } from 'h3'
import { and, eq, isNull } from 'drizzle-orm'
import { requireAdmin } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { transactionCategories } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  const row = await db.query.transactionCategories.findFirst({
    where: and(eq(transactionCategories.id, id), isNull(transactionCategories.deletedAt)),
  })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan' })
  return row
})
