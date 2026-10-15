import { and, asc, desc, eq, gte, isNull, or } from 'drizzle-orm'
import { z } from 'zod'
import { categories, events } from '~~/server/db/schema'

const querySchema = z.object({
  category: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
})

/** Published upcoming / ongoing events for the public portal. */
export default defineEventHandler(async (event) => {
  const { category, limit } = readZodQuery(event, querySchema)
  const today = dateInTimeZone(await getMosqueTimezone())

  let categoryId: string | undefined
  if (category) {
    const cat = await db.query.categories.findFirst({
      where: and(eq(categories.slug, category), isNull(categories.deletedAt)),
      columns: { id: true },
    })
    if (!cat) return []
    categoryId = cat.id
  }

  const rows = await db.query.events.findMany({
    where: and(
      isNull(events.deletedAt),
      eq(events.status, 'published'),
      categoryId ? eq(events.categoryId, categoryId) : undefined,
      or(gte(events.startDate, today), gte(events.endDate, today)),
    ),
    columns: {
      createdBy: false,
      updatedBy: false,
      deletedAt: false,
      livestreamUrl: false,
    },
    with: {
      category: { columns: { id: true, slug: true, name: true, icon: true, colorToken: true } },
      speakers: { columns: { name: true, role: true }, orderBy: (s, { asc }) => [asc(s.sortOrder)] },
    },
    orderBy: [desc(events.isPinned), asc(events.startDate), asc(events.startTime)],
    limit,
  })

  return withEventStats(rows, today)
})
