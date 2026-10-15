import { and, desc, eq, isNull } from 'drizzle-orm'
import { events, registrants } from '~~/server/db/schema'

export default defineTenantHandler('staff', async (event, { db, tenant }) => {
  const id = requireRouterId(event)
  const today = dateInTimeZone(tenant.timezone)

  const row = await db.query.events.findFirst({
    where: and(eq(events.id, id), isNull(events.deletedAt)),
    with: {
      category: { columns: { id: true, slug: true, name: true, icon: true, colorToken: true } },
      speakers: { columns: { id: true, name: true, role: true }, orderBy: (s, { asc }) => [asc(s.sortOrder)] },
      agenda: { orderBy: (a, { asc }) => [asc(a.sortOrder)] },
      creator: { columns: { id: true, fullName: true } },
      updater: { columns: { id: true, fullName: true } },
      registrants: {
        where: and(isNull(registrants.deletedAt), isNull(registrants.cancelledAt)),
        orderBy: [desc(registrants.registeredAt)],
        limit: 8,
        columns: { id: true, registeredAt: true, attendedAt: true },
        with: { user: { columns: { id: true, fullName: true, email: true } } },
      },
    },
  })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Kegiatan tidak ditemukan' })

  const { registrants: recentRegistrants, ...rest } = row
  const [withStats] = await withEventStats(db, [rest], today)
  return { ...withStats!, recentRegistrants }
})
