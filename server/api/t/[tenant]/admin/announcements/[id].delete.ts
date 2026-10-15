import { and, eq, isNull } from 'drizzle-orm'
import { announcements } from '~~/server/db/schema'

export default defineTenantHandler('admin', async (event, { db, user }) => {
  const id = requireRouterId(event)
  const [row] = await db
    .update(announcements)
    .set({ deletedAt: new Date(), updatedBy: user.id })
    .where(and(eq(announcements.id, id), isNull(announcements.deletedAt)))
    .returning({ id: announcements.id })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Pengumuman tidak ditemukan' })
  return { deleted: true }
})
