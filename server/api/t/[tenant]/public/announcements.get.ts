import { and, desc, eq, gte, isNull, lte, or } from 'drizzle-orm'
import { announcements } from '~~/server/db/schema'
import { publicAnnouncementQuery } from '#shared/schemas/announcements'

/** Published announcements visible today (mosque-local), pinned first. */
export default defineTenantHandler('public', async (event, { db, tenant }) => {
  const { limit, display } = readZodQuery(event, publicAnnouncementQuery)
  const today = dateInTimeZone(tenant.timezone)
  return db
    .select({
      id: announcements.id,
      title: announcements.title,
      body: announcements.body,
      isPinned: announcements.isPinned,
      startsOn: announcements.startsOn,
      endsOn: announcements.endsOn,
      publishedAt: announcements.publishedAt,
    })
    .from(announcements)
    .where(and(
      isNull(announcements.deletedAt),
      eq(announcements.status, 'published'),
      or(isNull(announcements.startsOn), lte(announcements.startsOn, today)),
      or(isNull(announcements.endsOn), gte(announcements.endsOn, today)),
      display ? eq(announcements.showOnDisplay, true) : undefined,
    ))
    .orderBy(desc(announcements.isPinned), desc(announcements.publishedAt))
    .limit(limit)
})
