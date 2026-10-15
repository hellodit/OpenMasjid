import { and, eq, isNull } from 'drizzle-orm'
import slugify from 'slugify'
import { transactionCategories } from '~~/server/db/schema'
import { categoryCreateSchema } from '#shared/schemas/cashbook'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const data = await readZodBody(event, categoryCreateSchema)

  if (data.parentId) {
    const parent = await db.query.transactionCategories.findFirst({
      where: and(eq(transactionCategories.id, data.parentId), isNull(transactionCategories.deletedAt)),
    })
    if (!parent) throw createError({ statusCode: 400, statusMessage: 'Parent kategori tidak ditemukan' })
    if (parent.parentId)
      throw createError({ statusCode: 400, statusMessage: 'Maksimal 2 level hierarki (parent sudah punya parent)' })
    if (parent.type !== data.type)
      throw createError({ statusCode: 400, statusMessage: 'Tipe kategori harus sama dengan parent' })
  }

  const slug = data.slug ?? slugify(data.name, { lower: true, strict: true })
  const existing = await db.query.transactionCategories.findFirst({
    where: and(eq(transactionCategories.slug, slug), isNull(transactionCategories.deletedAt)),
    columns: { id: true },
  })
  if (existing) throw createError({ statusCode: 409, statusMessage: 'Slug kategori sudah digunakan' })

  const [row] = await db
    .insert(transactionCategories)
    .values({ ...data, parentId: data.parentId ?? null, slug, createdBy: user.id, updatedBy: user.id })
    .returning()
  setResponseStatus(event, 201)
  return row
})
