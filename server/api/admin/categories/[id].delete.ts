import { and, count, eq, isNull } from 'drizzle-orm'
import { categories, events } from '~~/server/db/schema'

/** Categories that still have events are archived instead of deleted. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = requireRouterId(event)

  const [usage] = await db
    .select({ n: count() })
    .from(events)
    .where(and(eq(events.categoryId, id), isNull(events.deletedAt)))

  const where = and(eq(categories.id, id), isNull(categories.deletedAt))
  const [row] = (usage?.n ?? 0) > 0
    ? await db.update(categories).set({ isActive: false }).where(where).returning()
    : await db.update(categories).set({ deletedAt: new Date(), isActive: false }).where(where).returning()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan' })
  return { archived: !row.deletedAt, deleted: !!row.deletedAt, category: row }
})
