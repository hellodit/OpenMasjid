import { and, eq, isNull } from 'drizzle-orm'
import slugify from 'slugify'
import { categories } from '~~/server/db/schema'
import { eventCategoryCreateSchema } from '#shared/schemas/events'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await readZodBody(event, eventCategoryCreateSchema)
  const slug = data.slug ?? slugify(data.name, { lower: true, strict: true })

  const existing = await db.query.categories.findFirst({
    where: and(eq(categories.slug, slug), isNull(categories.deletedAt)),
    columns: { id: true },
  })
  if (existing) throw createError({ statusCode: 409, statusMessage: 'Slug kategori sudah digunakan' })

  const [row] = await db.insert(categories).values({ ...data, slug }).returning()
  setResponseStatus(event, 201)
  return row
})
