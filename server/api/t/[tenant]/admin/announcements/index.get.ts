import { and, desc, eq, isNull } from 'drizzle-orm'
import { announcements } from '~~/server/db/schema'
import { announcementListQuery } from '#shared/schemas/announcements'

/** All announcements (any status) with their visibility for today. */
export default defineTenantHandler('staff', async (event, { db, tenant }) => {
  const { status } = readZodQuery(event, announcementListQuery)
  const today = dateInTimeZone(tenant.timezone)
  const rows = await db.query.announcements.findMany({
    where: and(isNull(announcements.deletedAt), status ? eq(announcements.status, status) : undefined),
    orderBy: [desc(announcements.isPinned), desc(announcements.createdAt)],
    with: { creator: { columns: { fullName: true } } },
  })
  return rows.map(({ creator, tenantId: _t, deletedAt: _d, ...a }) => ({
    ...a,
    createdByName: creator?.fullName ?? null,
    visibility: announcementVisibility(a, today),
  }))
})
