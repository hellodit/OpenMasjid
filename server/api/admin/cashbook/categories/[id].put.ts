import { and, eq, isNull, ne } from 'drizzle-orm'
import slugify from 'slugify'
import { transactionCategories } from '~~/server/db/schema'
import { categoryUpdateSchema } from '#shared/schemas/cashbook'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = requireRouterId(event)
  const data = await readZodBody(event, categoryUpdateSchema)

  const current = await db.query.transactionCategories.findFirst({
    where: and(eq(transactionCategories.id, id), isNull(transactionCategories.deletedAt)),
    with: { children: { columns: { id: true }, where: isNull(transactionCategories.deletedAt) } },
  })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan' })

  if (data.parentId) {
    if (data.parentId === id)
      throw createError({ statusCode: 400, statusMessage: 'Kategori tidak boleh jadi parent dirinya sendiri' })
    const parent = await db.query.transactionCategories.findFirst({
      where: and(eq(transactionCategories.id, data.parentId), isNull(transactionCategories.deletedAt)),
    })
    if (!parent) throw createError({ statusCode: 400, statusMessage: 'Parent kategori tidak ditemukan' })
    if (parent.parentId)
      throw createError({ statusCode: 400, statusMessage: 'Maksimal 2 level hierarki' })
    if (parent.type !== current.type)
      throw createError({ statusCode: 400, statusMessage: 'Tipe parent harus sama' })
    if (current.children.length)
      throw createError({
        statusCode: 400,
        statusMessage: 'Kategori ini sudah punya sub-kategori, tidak bisa dipindah ke bawah parent lain',
      })
  }

  let slug = data.slug
  if (slug === undefined && data.name !== undefined)
    slug = slugify(data.name, { lower: true, strict: true })
  if (slug !== undefined && slug !== current.slug) {
    const existing = await db.query.transactionCategories.findFirst({
      where: and(
        eq(transactionCategories.slug, slug),
        isNull(transactionCategories.deletedAt),
        ne(transactionCategories.id, id),
      ),
      columns: { id: true },
    })
    if (existing) throw createError({ statusCode: 409, statusMessage: 'Slug kategori sudah digunakan' })
  }

  const [row] = await db
    .update(transactionCategories)
    .set({ ...data, slug, updatedBy: user.id })
    .where(eq(transactionCategories.id, id))
    .returning()
  return row
})
