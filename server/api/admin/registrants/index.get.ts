import { and, count, desc, eq, ilike, isNotNull, isNull, or } from 'drizzle-orm'
import { categories, events, registrants, users } from '~~/server/db/schema'
import { registrantListQuery } from '#shared/schemas/events'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const params = readZodQuery(event, registrantListQuery)

  const where = and(
    isNull(registrants.deletedAt),
    isNull(events.deletedAt),
    params.eventId ? eq(registrants.eventId, params.eventId) : undefined,
    params.status === 'cancelled' ? isNotNull(registrants.cancelledAt) : undefined,
    params.status === 'attended' ? and(isNull(registrants.cancelledAt), isNotNull(registrants.attendedAt)) : undefined,
    params.status === 'confirmed' ? and(isNull(registrants.cancelledAt), isNull(registrants.attendedAt)) : undefined,
    params.q
      ? or(
          ilike(users.fullName, `%${escapeLike(params.q)}%`),
          ilike(users.email, `%${escapeLike(params.q)}%`),
          ilike(events.title, `%${escapeLike(params.q)}%`),
        )
      : undefined,
  )

  const base = db
    .select({
      id: registrants.id,
      registeredAt: registrants.registeredAt,
      attendedAt: registrants.attendedAt,
      cancelledAt: registrants.cancelledAt,
      source: registrants.source,
      user: { id: users.id, fullName: users.fullName, email: users.email, phone: users.phone },
      event: { id: events.id, title: events.title, startDate: events.startDate },
      category: { slug: categories.slug, name: categories.name },
    })
    .from(registrants)
    .innerJoin(users, eq(registrants.userId, users.id))
    .innerJoin(events, eq(registrants.eventId, events.id))
    .innerJoin(categories, eq(events.categoryId, categories.id))
    .where(where)

  const [rows, [total]] = await Promise.all([
    base.orderBy(desc(registrants.registeredAt)).limit(params.pageSize).offset((params.page - 1) * params.pageSize),
    db
      .select({ n: count() })
      .from(registrants)
      .innerJoin(users, eq(registrants.userId, users.id))
      .innerJoin(events, eq(registrants.eventId, events.id))
      .where(where),
  ])

  return {
    data: rows.map((r) => ({ ...r, status: deriveRegistrantStatus(r) })),
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      total: total?.n ?? 0,
      totalPages: Math.max(1, Math.ceil((total?.n ?? 0) / params.pageSize)),
    },
  }
})
