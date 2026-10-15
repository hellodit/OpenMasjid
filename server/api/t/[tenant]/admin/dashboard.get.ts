import { and, asc, count, desc, eq, gte, isNull, lte, sql } from 'drizzle-orm'
import { categories, events, registrants } from '~~/server/db/schema'

/** Aggregates for the admin dashboard. */
export default defineTenantHandler('staff', async (event, { db, tenant }) => {
  const tz = tenant.timezone
  const today = dateInTimeZone(tz)
  const sevenDaysAgo = new Date(Date.now() - 6 * 86_400_000)
  const activeReg = and(isNull(registrants.deletedAt), isNull(registrants.cancelledAt))

  const [
    [activeEvents],
    [regTotals],
    perDay,
    perCategory,
    todayEvents,
    upcoming,
    recent,
  ] = await Promise.all([
    db
      .select({ n: count() })
      .from(events)
      .where(and(isNull(events.deletedAt), eq(events.status, 'published'), sql`COALESCE(${events.endDate}, ${events.startDate}) >= ${today}`)),
    db
      .select({ registered: count(), attended: sql<number>`COUNT(${registrants.attendedAt})::int` })
      .from(registrants)
      .where(activeReg),
    db
      .select({
        day: sql<string>`to_char(${registrants.registeredAt} AT TIME ZONE ${tz}, 'YYYY-MM-DD')`,
        n: count(),
      })
      .from(registrants)
      .where(and(activeReg, gte(registrants.registeredAt, sevenDaysAgo)))
      .groupBy(sql`1`),
    db
      .select({ slug: categories.slug, name: categories.name, colorToken: categories.colorToken, n: count(events.id) })
      .from(categories)
      .leftJoin(events, and(eq(events.categoryId, categories.id), isNull(events.deletedAt)))
      .where(isNull(categories.deletedAt))
      .groupBy(categories.id)
      .orderBy(desc(count(events.id))),
    db.query.events.findMany({
      where: and(isNull(events.deletedAt), eq(events.status, 'published'), lte(events.startDate, today), sql`COALESCE(${events.endDate}, ${events.startDate}) >= ${today}`),
      with: { category: { columns: { slug: true, name: true } } },
      orderBy: [asc(events.startTime)],
    }),
    db.query.events.findMany({
      where: and(isNull(events.deletedAt), eq(events.status, 'published'), gte(events.startDate, today)),
      with: { category: { columns: { slug: true, name: true } } },
      orderBy: [asc(events.startDate), asc(events.startTime)],
      limit: 5,
    }),
    db.query.registrants.findMany({
      where: activeReg,
      orderBy: [desc(registrants.registeredAt)],
      limit: 6,
      columns: { id: true, registeredAt: true, attendedAt: true },
      with: {
        user: { columns: { fullName: true } },
        event: { columns: { id: true, title: true } },
      },
    }),
  ])

  // Fill the 7-day series so days without registrations show as 0.
  const series = Array.from({ length: 7 }, (_, i) => {
    const day = dateInTimeZone(tz, new Date(Date.now() - (6 - i) * 86_400_000))
    return { day, count: perDay.find((d) => d.day === day)?.n ?? 0 }
  })

  const registered = regTotals?.registered ?? 0
  const attended = regTotals?.attended ?? 0

  return {
    today,
    stats: {
      activeEvents: activeEvents?.n ?? 0,
      registered,
      attended,
      attendanceRate: registered ? Math.round((attended / registered) * 100) : 0,
    },
    registrationsLast7Days: series,
    eventsPerCategory: perCategory,
    todayEvents: await withEventStats(db, todayEvents, today),
    upcomingEvents: await withEventStats(db, upcoming, today),
    recentRegistrations: recent,
  }
})
