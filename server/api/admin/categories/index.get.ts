import { and, asc, count, eq, isNull } from 'drizzle-orm'
import { categories, events } from '~~/server/db/schema'

/** Event categories with event counts. */
export default defineEventHandler(async (event) => {
  await requireStaff(event)
  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      icon: categories.icon,
      colorToken: categories.colorToken,
      sortOrder: categories.sortOrder,
      isActive: categories.isActive,
      eventCount: count(events.id),
    })
    .from(categories)
    .leftJoin(events, and(eq(events.categoryId, categories.id), isNull(events.deletedAt)))
    .where(isNull(categories.deletedAt))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name))
})
