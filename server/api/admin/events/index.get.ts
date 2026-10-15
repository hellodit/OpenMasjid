import { and, asc, count, desc, eq, gte, ilike, isNull, lt, or, sql } from 'drizzle-orm'
import { events } from '~~/server/db/schema'
import { eventListQuery } from '#shared/schemas/events'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const params = readZodQuery(event, eventListQuery)
  const today = dateInTimeZone(await getMosqueTimezone())
  const endExpr = sql`COALESCE(${events.endDate}, ${events.startDate})`
  // Table-qualified on purpose: inside a correlated subquery an unqualified
  // "id" would bind to registrants.id (see AGENTS.md, Drizzle pitfall).
  const registered = sql`(SELECT COUNT(*) FROM registrants r WHERE r.event_id = ${sql.raw('"events"."id"')} AND r.deleted_at IS NULL AND r.cancelled_at IS NULL)`
  const ongoing = and(sql`${events.startDate} <= ${today}`, sql`${endExpr} >= ${today}`)
  const notOngoing = sql`NOT (${ongoing})`

  // Mirrors deriveEventStatus() in SQL so pagination totals stay correct.
  const statusWhere = (() => {
    switch (params.status) {
      case 'draft':
      case 'archived':
        return eq(events.status, params.status)
      case 'published':
        return and(
          eq(events.status, 'published'),
          notOngoing,
          sql`(${events.capacity} IS NULL OR ${registered} < ${events.capacity})`,
        )
      case 'full':
        return and(
          eq(events.status, 'published'),
          notOngoing,
          sql`${events.capacity} IS NOT NULL AND ${registered} >= ${events.capacity}`,
        )
      case 'ongoing':
        return and(eq(events.status, 'published'), ongoing)
      case 'upcoming':
        return gte(events.startDate, today)
      case 'past':
        return lt(endExpr, today)
      default:
        return undefined
    }
  })()

  const where = and(
    isNull(events.deletedAt),
    params.categoryId ? eq(events.categoryId, params.categoryId) : undefined,
    params.q
      ? or(
          ilike(events.title, `%${escapeLike(params.q)}%`),
          ilike(events.locationName, `%${escapeLike(params.q)}%`),
        )
      : undefined,
    statusWhere,
  )

  const [rows, [total]] = await Promise.all([
    db.query.events.findMany({
      where,
      with: {
        category: { columns: { id: true, slug: true, name: true, icon: true, colorToken: true } },
        speakers: { columns: { name: true, role: true }, orderBy: (s, { asc }) => [asc(s.sortOrder)] },
      },
      orderBy: [desc(events.isPinned), desc(events.startDate), asc(events.startTime)],
      limit: params.pageSize,
      offset: (params.page - 1) * params.pageSize,
    }),
    db.select({ n: count() }).from(events).where(where),
  ])

  const data = await withEventStats(rows, today)

  return {
    data,
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      total: total?.n ?? 0,
      totalPages: Math.max(1, Math.ceil((total?.n ?? 0) / params.pageSize)),
    },
  }
})
