import { and, eq, isNull } from 'drizzle-orm'
import { announcements } from '~~/server/db/schema'
import { announcementSchema } from '#shared/schemas/announcements'

export default defineTenantHandler('admin', async (event, { db, user }) => {
  const id = requireRouterId(event)
  const data = await readZodBody(event, announcementSchema)
  const where = and(eq(announcements.id, id), isNull(announcements.deletedAt))

  const current = await db.query.announcements.findFirst({ where, columns: { publishedAt: true } })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Pengumuman tidak ditemukan' })

  const [row] = await db
    .update(announcements)
    .set({
      ...data,
      // First publish time is kept; it only orders the list.
      publishedAt: data.status === 'published' ? (current.publishedAt ?? new Date()) : current.publishedAt,
      updatedBy: user.id,
    })
    .where(where)
    .returning()
  return row
})
