import { and, eq, isNull, ne } from 'drizzle-orm'
import { categories } from '~~/server/db/schema'
import { eventCategoryUpdateSchema } from '#shared/schemas/events'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = requireRouterId(event)
  const data = await readZodBody(event, eventCategoryUpdateSchema)

  if (data.slug) {
    const existing = await db.query.categories.findFirst({
      where: and(eq(categories.slug, data.slug), isNull(categories.deletedAt), ne(categories.id, id)),
      columns: { id: true },
    })
    if (existing) throw createError({ statusCode: 409, statusMessage: 'Slug kategori sudah digunakan' })
  }

  const [row] = await db
    .update(categories)
    .set(data)
    .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
    .returning()
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan' })
  return row
})
