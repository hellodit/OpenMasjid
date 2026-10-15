import { and, eq, isNull } from 'drizzle-orm'
import { events } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = requireRouterId(event)
  const [row] = await db
    .update(events)
    .set({ deletedAt: new Date(), updatedBy: user.id })
    .where(and(eq(events.id, id), isNull(events.deletedAt)))
    .returning({ id: events.id })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Kegiatan tidak ditemukan' })
  return { deleted: true }
})
